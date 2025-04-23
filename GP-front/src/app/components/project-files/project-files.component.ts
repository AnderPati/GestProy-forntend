import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../services/file.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-project-files',
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.scss'],
})

export class ProjectFilesComponent implements OnInit {
  projectId!: number;
  files: any[] = [];
  selectedFile: File | null = null;
  isDragging = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  constructor(
    private route: ActivatedRoute,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadFiles();
    
  }

  loadFiles() {
    this.fileService.getFiles(this.projectId).subscribe((files) => {
      this.files = files.map(file => ({ ...file, dropdownOpen: false }));
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  upload() {
    if (!this.selectedFile) return;

    this.fileService
      .uploadFile(this.projectId, this.selectedFile)
      .subscribe(() => {
        this.selectedFile = null;
        this.loadFiles();
      });
  }

  download(fileId: number, fileName: string) {
    this.fileService.downloadFile(fileId).subscribe((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }

  delete(fileId: number) {
    this.fileService.deleteFile(fileId).subscribe(() => {
      this.loadFiles();
    });
  }

  preview(file: any) {
    const isImage = file.mime_type.startsWith('image/');
  
    this.fileService.downloadFile(file.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
  
      if (isImage) {
        Swal.fire({
          html: `<img src="${url}" style="max-width: 1000px; width: 90%; max-height: 1000px; height: 90%; border-radius: 10px; margin-top: 30px;" />`,
          width: 'auto',
          background: 'transparent',
          showCloseButton: true,
          showConfirmButton: false
        });
      } else {
        // PDF o cualquier otro tipo abrir en nueva pestaña
        window.open(url, '_blank');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.file-actions.mobile');
    if (!clickedInside) {
      this.files.forEach(f => f.dropdownOpen = false);
    }
  }

  toggleDropdown(selectedFile: any) {
    this.files.forEach(file => {
      if (file !== selectedFile) {
        file.dropdownOpen = false;
      }
    });
    selectedFile.dropdownOpen = !selectedFile.dropdownOpen;
  }
  
}
