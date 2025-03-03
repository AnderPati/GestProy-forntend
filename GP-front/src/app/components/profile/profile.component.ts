import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = { name: '', email: '', password: '', profile_image: '' };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe(
      data => {
        this.user = data;
      },
      () => {
        this.errorMessage = 'Error al cargar el perfil.';
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
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
        this.successMessage = response.message;
        this.user = response.user; // Actualizar la vista
      },
      () => {
        this.errorMessage = 'Error al actualizar el perfil.';
      }
    ).add(() => {
      this.isLoading = false;
    });
  }
}
