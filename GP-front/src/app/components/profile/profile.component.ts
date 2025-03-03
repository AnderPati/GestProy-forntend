import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = { name: '', email: '', password: '' };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

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

  onSubmit() {
    this.isLoading = true;
    this.profileService.updateProfile(this.user).subscribe(
      response => {
        this.successMessage = response.message;
      },
      () => {
        this.errorMessage = 'Error al actualizar el perfil.';
      }
    ).add(() => {
      this.isLoading = false;
    });
  }
}
