import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProfileService } from '../../services/profile.service';
import Swal from 'sweetalert2';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = { name: '', email: '', password: '', profile_image: '' };
  currentPassword: string = '';
  originalUser: any = {};
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;
  hovering: boolean = false;
  usedStorage: number = 0;
  storageLimit: number = 0;
  freeStorage: number = 0;
  displayedStoragePercentage: number = 0;
  imageChangedEvent: any = '';
  croppedImage: string | null | undefined;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private titleService: Title,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Perfil');
    this.profileService.getProfile().subscribe(
      response => {
        this.user = { ...response.data, password: '' }; // Copiamos los datos en `user`
        this.originalUser = { ...response.data, password: '' }; // Guardamos los valores originales
        this.titleService.setTitle(`Perfil - ${this.user.name}`); // Cambiamos el título de la página
      },
      () => {
        this.errorMessage = 'Error al cargar el perfil.';
      }
    );
    this.profileService.getStorageUsage().subscribe(data => {
      this.usedStorage = data.used;
      this.storageLimit = data.storage_limit;
      this.freeStorage = data.free;

      this.animateStoragePercentage();
    });
  }

  get storageUsagePercentage(): number {
    return this.storageLimit > 0 ? (this.usedStorage / this.storageLimit) * 100 : 0;
  }

  animateStoragePercentage() {
    const duration = 1000; // duración total en ms (1 segundo)
    const frameRate = 30; // 60 frames por segundo
    const totalFrames = duration / (1000 / frameRate);
    const increment = this.storageUsagePercentage / totalFrames;
    
    let currentFrame = 0;
  
    const interval = setInterval(() => {
      this.displayedStoragePercentage += increment;
      currentFrame++;
  
      if (currentFrame >= totalFrames) {
        this.displayedStoragePercentage = this.storageUsagePercentage; // aseguramos que termine exacto
        clearInterval(interval);
      }
    }, 1000 / frameRate);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  isFieldEdited(field: string): boolean {
    if (field === 'password') {
      return this.user.password && this.user.password.trim() !== ''; // Solo marcar si el usuario ha escrito algo
    }
    if (field === 'profile_image') {
      return this.selectedFile !== null; // Marcar como editado si se seleccionó una imagen nueva
    }
    return this.user[field] !== this.originalUser[field];
  }
  
  fileChangeEvent(event: any): void {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      console.warn('Archivo no válido.');
      return;
    }

    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {

    if (event.blob) {
      this.selectedFile = new File([event.blob], 'avatar.png', { type: event.blob.type });
      this.croppedImage = event.objectUrl; // Para vista previa
    }
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  cancelCrop() {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.selectedFile = null;
  }

  onSubmit() {    
    if (this.user.password && this.user.password.trim() !== '' && (!this.currentPassword || this.currentPassword.trim() === '')) {
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    
    if (this.currentPassword) {
      formData.append('current_password', this.currentPassword);
    }
    if (this.user.password) {
      formData.append('password', this.user.password);
    }
  
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }
  
    this.profileService.updateProfile(formData).subscribe(
      response => {
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          background: 'transparent',
          icon: 'success',
          showConfirmButton: false,
          timer: 3000,
          customClass: {
            popup: 'custom-toast'
          }
        });
  
        this.user = { ...response.user, password: '' }; // Actualizar la vista con los nuevos datos
        this.originalUser = { ...this.user, password: '' }
        this.currentPassword = "";
        this.croppedImage = null;
        this.imageChangedEvent = null;
        this.selectedFile = null;
        URL.revokeObjectURL(this.croppedImage!);
      },
      error => {
        Swal.fire({
          title: error.error.message,
          icon: 'error'
        });
      }
    ).add(() => {
      this.isLoading = false;
    });
  }
  

  removeProfileImage() {
    Swal.fire({
      text: 'Esta acción eliminará tu imagen de perfil.',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#5e4b56',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      position: 'top',
    }).then((result) => {
      if (result.isConfirmed) {
        this.profileService.deleteProfileImage().subscribe(
          response => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              background: 'transparent',
              icon: 'success',
              showConfirmButton: false,
              timer: 3000,
              customClass: {
                popup: 'custom-toast'
              }
            });
            this.user.profile_image = null;
            this.selectedFile = null;
          }
        );
      }
    });
  }

  validateField(field: string): string {
    if (field === 'name' && this.user.name.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }
    if (field === 'email' && !/^\S+@\S+\.\S+$/.test(this.user.email)) {
      return 'Introduce un correo válido.';
    }
    if (field === 'password' && this.user.password && !this.currentPassword) {
      return 'Debes ingresar tu contraseña actual.';
    }
    if (field === 'newPassword' && this.user.password && this.user.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return '';
  }
  
}
