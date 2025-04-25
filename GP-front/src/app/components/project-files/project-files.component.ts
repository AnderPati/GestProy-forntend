import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../services/file.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-project-files',
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.scss'],
})
export class ProjectFilesComponent implements OnInit {
  projectId!: number;
  files: any[] = [];
  selectedFile: File | null = null;
  folders: any[] = [];
  currentFolderId: number | null = null;
  currentFolderName: string | null = null;
  isDragging = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadFiles();
    this.loadFolders();
  }

  get filteredFiles() {
    return this.currentFolderId === null
      ? this.files.filter(f => !f.folder_id)
      : this.files.filter(f => f.folder_id === this.currentFolderId);
  }

  loadFolders() {
    this.fileService.getFolders(this.projectId).subscribe(folders => {
      this.folders = folders.map(f => ({
        ...f,
        dropdownOpen: false,
        fileCount: 0
      }));
      this.updateFolderCounts();
    });
  }

  loadFiles() {
    this.fileService.getFiles(this.projectId).subscribe(files => {
      this.files = files;
      this.updateFolderCounts();
    });
  }

  updateFolderCounts() {
    this.folders.forEach(folder => {
      folder.fileCount = this.files.filter(f => f.folder_id === folder.id).length;
    });
  }

  openFolder(folder: any) {
    this.currentFolderId = folder.id;
    this.currentFolderName = folder.name;
  }

  goBackFolder() {
    this.currentFolderId = null;
    this.currentFolderName = null;
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
      .uploadFile(this.projectId, this.selectedFile, this.currentFolderId)
      .subscribe(() => {
        this.selectedFile = null;
        this.loadFiles();
      });
  }

  download(fileId: number, fileName: string) {
    this.fileService.downloadFile(fileId).subscribe(blob => {
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

  toggleFolderDropdown(folder: any, event: MouseEvent) {
    event.stopPropagation();

    this.folders.forEach(f => {
      if (f !== folder) f.dropdownOpen = false;
    });

    folder.dropdownOpen = !folder.dropdownOpen;

    this.cdr.detectChanges(); // fuerza renderizado del DOM
  }

  toggleDropdown(selectedFile: any) {
    this.files.forEach(file => {
      if (file !== selectedFile) file.dropdownOpen = false;
    });
    selectedFile.dropdownOpen = !selectedFile.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideFile = (event.target as HTMLElement).closest('.file-actions.mobile');
    const clickedInsideFolder = (event.target as HTMLElement).closest('.folder-actions');
    if (!clickedInsideFile && !clickedInsideFolder) {
      this.files.forEach(f => f.dropdownOpen = false);
      this.folders.forEach(f => f.dropdownOpen = false);
    }
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
        window.open(url, '_blank');
      }
    });
  }

  promptNewFolder() {
    Swal.fire({
      position: 'top',
      title: 'Nueva carpeta',
      input: 'text',
      inputPlaceholder: 'Nombre de la carpeta',
      showCancelButton: true,
      background: 'linear-gradient(180deg, #4a7362, #4a7362, transparent)',
      confirmButtonText: 'Crear',
      confirmButtonColor: '#4a7362',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#8d5b5b',
      customClass: {
        title: 'sa2Title',
        input: 'sa2Title',
      },
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const name = result.value.trim();
        this.fileService.createFolder(this.projectId, name).subscribe(() => {
          this.loadFolders();
          setTimeout(() => {
            const justCreated = this.folders.find(f => f.name === name);
            if (justCreated) this.openFolder(justCreated);
          }, 100);
        });
      }
    });
  }
  
  renameFolder(folder: any) {
    Swal.fire({
      position: 'top',
      title: 'Renombrar carpeta - ' + folder.name,
      inputPlaceholder: folder.name,
      input: 'text',
      inputValue: folder.name,
      showCancelButton: true,
      background: 'linear-gradient(180deg, #a67c52, #a67c52, transparent)',
      confirmButtonText: 'Renombrar',
      confirmButtonColor: '#a67c52',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#8d5b5b',
      customClass: {
        title: 'sa2Title',
        input: 'sa2Title',
      },
    }).then(result => {
      if (result.isConfirmed && result.value.trim()) {
        const newName = result.value.trim();
        this.fileService.renameFolder(this.projectId, folder.id, newName).subscribe(() => {
          this.loadFolders();
          Swal.fire('Renombrada', 'La carpeta ha sido renombrada', 'success');
        });
      }
    });
  }

  promptMoveFile(file: any) {
    Swal.fire({
      title: 'Mover archivo',
      input: 'select',
      inputOptions: {
        '': 'Carpeta principal',
        ...this.folders.reduce((acc, folder) => {
          acc[folder.id] = folder.name;
          return acc;
        }, {} as any)
      },
      inputPlaceholder: 'Selecciona carpeta',
      showCancelButton: true,
      confirmButtonText: 'Mover',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed && result.value !== undefined) {
        const newFolderId = result.value || null;

        this.fileService.updateFileFolder(file.id, result.value).subscribe(() => {
          Swal.fire({
            toast: true,
            position: 'top',
            background: 'transparent',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              popup: 'custom-toast'
            }
          });
          this.loadFiles();
        });
      }
    });
  }

  deleteFolder(folder: any) {
    Swal.fire({
      title: `¿Eliminar carpeta "${folder.name}"?`,
      text: 'Esto eliminará la carpeta si está vacía.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.fileService.deleteFolder(this.projectId, folder.id).subscribe({
          next: () => {
            this.loadFolders();
            this.goBackFolder();
            Swal.fire({
              toast: true,
              position: 'top',
              background: 'transparent',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
              customClass: {
                popup: 'custom-toast'
              }
            });
          },
          error: err => {
            Swal.fire('Error', err.error.message || 'No se pudo eliminar la carpeta', 'error');
          }
        });
      }
    });
  }
}
