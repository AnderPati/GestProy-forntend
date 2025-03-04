import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ProfileService } from '../../services/profile.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = { name: '', email: '', password: '', profile_image: '' };
  originalUser: any = {};
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;
  hovering: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe(
      data => {
        this.user = { ...data, password: '' }; // Copiamos los datos en `user`
        this.originalUser = { ...data, password: '' }; // Guardamos los valores originales
      },
      () => {
        this.errorMessage = 'Error al cargar el perfil.';
      }
    );
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
  
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
  
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor, selecciona un archivo de imagen válido.';
        return;
      }
  
      // Validar el tamaño de la imagen (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'El tamaño de la imagen debe ser menor a 2MB.';
        return;
      }
  
      this.selectedFile = file;
  
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // Almacenar la imagen en base64
      };
      reader.readAsDataURL(file);
    }
  }
  

  onSubmit() {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    
    if (this.user.password) {
      formData.append('password', this.user.password);
    }
  
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }
  
    this.profileService.updateProfile(formData).subscribe(
      response => {
        Swal.fire({
          title: 'Perfil actualizado',
          color: '#5e4b56',
          icon: 'success',
          iconColor: '#5e4b56',
          background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
  
        this.user = { ...response.user, password: '' }; // Actualizar la vista con los nuevos datos
        this.originalUser = { ...this.user, password: '' }
      },
      () => {
        Swal.fire({
          title: "No se pudo actualizar el perfil",
          icon: 'error',
          showClass: {
            popup: `
              animate__animated
              animate__fadeInUp
              animate__faster
            `
          },
          hideClass: {
            popup: `
              animate__animated
              animate__fadeOutDown
              animate__faster
            `
          }
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
      position: 'top',
    }).then((result) => {
      if (result.isConfirmed) {
        this.profileService.deleteProfileImage().subscribe(
          response => {
            Swal.fire({
              title: 'Perfil actualizado',
              icon: 'success',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500
            });
            this.user.profile_image = null;
            this.imagePreview = null;
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
    if (field === 'password' && this.user.password && this.user.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return '';
  }
  
}
