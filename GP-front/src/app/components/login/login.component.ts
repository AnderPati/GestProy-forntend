import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.isLoading = true; // Activar animación de carga
    this.errorMessage = ''; // Limpiar mensaje de error previo
  
    this.authService.login(this.email, this.password, this.rememberMe).subscribe(
      response => {
        this.authService.saveToken(response.token, this.rememberMe);
        this.router.navigate(['/dashboard']); // Redirige tras el login
      },
      error => {
        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión o inténtalo más tarde.';
        }
        else {
          this.errorMessage = 'Ocurrió un error inesperado. Inténtalo más tarde.';
        }
      }
    ).add(() => {
      this.isLoading = false; // Desactivar animación de carga después de recibir respuesta
    });
  }
  
}
