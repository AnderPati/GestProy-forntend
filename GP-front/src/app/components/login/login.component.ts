// LoginComponent handles the login UI and logic: form creation, validation, password toggle, and token-based redirection.
//----
// Este componente gestiona la interfaz y lógica de inicio de sesión: crea el formulario, valida, alterna visibilidad de contraseña y redirige si ya hay token.

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('GestProy - Login');
    // Create the reactive form
    //----
    // Crear el formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Check for existing token and auto-login if valid
    //----
    // Verificar si hay un token existente y hacer login automático si es válido
    const token = this.authService.getToken();
    if (token) {
      this.profileService.getUser().subscribe(
        () => this.router.navigate(['/dashboard']),
        () => this.authService.removeToken() // If token is invalid, remove it | Si el token no es válido, se borra
      );
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword; // Toggles visibility of password input | Alterna la visibilidad del campo de contraseña
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return; // Do nothing if form is invalid | No hacer nada si el formulario no es válido
  
    this.isLoading = true;
    this.errorMessage = '';
  
    const { email, password, rememberMe } = this.loginForm.value;
  
    this.authService.login(email, password, rememberMe).subscribe({
      next: res => {
        this.authService.saveToken(res.token, rememberMe); // Save token based on 'remember me' flag | Guarda el token según la opción de recordar
        this.router.navigate(['/dashboard']); // Redirect on successful login | Redirige si el login tiene éxito
      },
      error: err => {
        // Handle various error cases with custom messages
        //----
        // Maneja distintos errores con mensajes personalizados
        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión o intentalo más tarde.';
        } else if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message; // Laravel may send a custom error message | Laravel puede mandar un mensaje personalizado
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Inténtalo más tarde.';
        }

        this.isLoading = false; // Stops loading spinner | Detiene el spinner de carga
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  get email() { return this.loginForm.get('email'); } // Getter for easier access in template | Getter para acceder más fácil desde la plantilla
  get password() { return this.loginForm.get('password'); } // Same for password | Lo mismo para password
}
