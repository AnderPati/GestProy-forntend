import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      // Verificar si el token es válido con el backend
      this.http.get('http://127.0.0.1:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe(
        () => {
          this.router.navigate(['/dashboard']); // Token válido, redirigir al dashboard
        },
        () => {
          this.authService.removeToken(); // Token inválido, eliminarlo
        }
      );
    }
  }

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
