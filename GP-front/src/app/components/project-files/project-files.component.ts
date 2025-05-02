import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  modalFileToMove: any = null;
  previews: { [fileId: string]: string } = {};

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
    private router: Router
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
    for (const file of this.files) {
      if (file.mime_type.startsWith('image/')) {
        this.fileService.downloadFile(file.id).subscribe(blob => {
          const url = URL.createObjectURL(blob);
          this.previews[file.id] = url;
        });
      }
    }
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
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.loadFiles();
        },
        error: (err) => {
          if (err.status === 400 && err.error?.message === 'Has excedido tu límite de almacenamiento.') {
            Swal.fire({
              position: 'top',
              title: '¡Espacio insuficiente!',
              text: 'Has alcanzado el límite de almacenamiento de tu cuenta. Elimina archivos antiguos para seguir subiendo nuevos archivos.',
              icon: 'warning',
              color: 'white',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#4a7362',
              footer: 'En tu perfil puedes encontrar más información.',
              customClass: {
                popup: 'swal-backdrop'
              },
              
            });
          } else {
            Swal.fire(
              'Error al subir el archivo',
              err.error.message || 'Ocurrió un error inesperado. Por favor, intenta más tarde.',
              'error'
            );
          }
        }
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

  delete(fileId: number, fileName: string) {
    Swal.fire({
      title: `¿Eliminar archivo permanentemente?`,
      text: fileName,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#693131',
      cancelButtonColor: '#38785c',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-backdrop'
      },
    }).then(result => {
      if (result.isConfirmed) {
        this.fileService.deleteFile(fileId).subscribe({
          next: () => {
            this.loadFiles();
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
            Swal.fire('Error', err.error.message || 'No se pudo eliminar el archivo', 'error');
          }
        });
      }
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
      confirmButtonText: 'Crear',
      confirmButtonColor: '#38785c',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#693131',
      customClass: {
        popup: 'swal-backdrop'
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
      confirmButtonText: 'Renombrar',
      confirmButtonColor: '#38785c',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#693131',
      customClass: {
        popup: 'swal-backdrop'
      },
    }).then(result => {
      if (result.isConfirmed && result.value.trim()) {
        const newName = result.value.trim();
        this.fileService.renameFolder(this.projectId, folder.id, newName).subscribe(() => {
          this.loadFolders();
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
        });
      }
    });
  }

  downloadFolder(folder: any) {
    this.fileService.downloadFolder(this.projectId, folder.id).subscribe((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${folder.name}.zip`;
      link.click();
      this.folders.forEach(f => f.dropdownOpen = false);
    });
  }

  deleteFolder(folder: any) {
    Swal.fire({
      title: `¿Eliminar carpeta "${folder.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#693131',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#38785c',
      position: 'top',
      customClass: {
        popup: 'swal-backdrop'
      },
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
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'error',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              title: err.error.message || 'No se pudo eliminar la carpeta',
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
              customClass: {
                popup: 'swal-backdrop'
              },
            });
          }
        });
      }
    });
  }

  promptMoveFile(file: any) {
    this.modalFileToMove = file;
  }

  onFolderMove(newFolderId: number | null) {
    if (!this.modalFileToMove) return;

    this.fileService.updateFileFolder(this.modalFileToMove.id, newFolderId).subscribe(() => {
      this.loadFiles();
      this.modalFileToMove = null;
    });
  }

  showProjectDetails() {
    // Datos generales
    const totalFiles = this.files.length;
    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
  
    // Archivos de la carpeta raíz (sin carpeta asignada)
    const rootFiles = this.files.filter(f => !f.folder_id);
    const rootSize = rootFiles.reduce((sum, f) => sum + f.size, 0);

    // Datos por carpeta
    const folderSummaries = this.folders.map(folder => {
      const filesInFolder = this.files.filter(f => f.folder_id === folder.id);
      const sizeInFolder = filesInFolder.reduce((sum, f) => sum + f.size, 0);
      return {
        name: folder.name,
        count: filesInFolder.length,
        size: sizeInFolder
      };
    });
  
    let html = `
      <div style="text-align: left; padding: 10px;">
        <h3 style="margin-top: 0;">Información general</h3>
        <p>
          <small>
            <label style="display: inline-block; width: 200px;"><i class="fa-solid fa-folder-tree" style="width: 20px;"></i> Total</label>
            <label style="display: inline-block; width: 100px;">${totalSize < 1048576 ? (totalSize / 1024).toFixed(2) + '&nbsp;KB' : (totalSize / 1048576).toFixed(2) + '&nbsp;MB'}</label>
             ${totalFiles}&nbsp;archivos
          </small>
        </p>
        <h3>Por carpeta:</h3>
        <small>
          <p style="margin: 2px 0;">
            <label style="display: inline-block; width: 200px;"><i class="fa-solid fa-folder-closed" style="width: 20px;"></i> Raíz</label>
            <label style="display: inline-block; width: 100px;">${rootSize < 1048576 ? (rootSize / 1024).toFixed(2) + '&nbsp;KB' : (rootSize / 1048576).toFixed(2) + '&nbsp;MB'}</label>
            ${rootFiles.length}&nbsp;archivos
          </p>`;

    if (folderSummaries.length === 0) {
      html += `<p>No hay carpetas creadas.</p>`;
    } else {
      folderSummaries.forEach(folder => {
        html += `
          <hr style="border: 1px solid #272727; margin: 0 0;">
          <p style="margin: 2px 0;">
            <label style="display: inline-block; width: 200px;"><i class="fa-solid fa-folder" style="width: 20px;"></i> ${folder.name}</label> 
            <label style="display: inline-block; width: 100px;">${folder.size < 1048576 ? (folder.size / 1024).toFixed(2) + '&nbsp;KB' : (folder.size / 1048576).toFixed(2) + '&nbsp;MB'}</label> 
            ${folder.count}&nbsp;archivos
          </p>`;
      });
    }

    html += `</small></div>`;

    Swal.fire({
      html,
      position: 'top',
      background: 'rgb(25, 25, 25)',
      color: 'white',
      width: '500px',
      showCloseButton: true,
      showConfirmButton: false
    });
  }
  
  getThumbnailUrl(file: any): string {
    return URL.createObjectURL(new Blob([file.previewBlob], { type: file.mime_type }));
  }

  getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'csv';
    }
    if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/javascript') {
      return 'code';
    }
    return 'default';
  }
}
