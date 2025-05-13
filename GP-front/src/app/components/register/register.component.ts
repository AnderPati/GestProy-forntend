// RegisterComponent: gestiona el formulario de registro, validación de datos, visibilidad de contraseña y autenticación con Google.

import {
  Component,
  OnInit,
  AfterViewInit,
  NgZone
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  nameError: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  passwordMismatch: boolean = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Registro');
  }

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  // --- Inicializadores ---

  private initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: '748909544242-hicfnrm9shl4v4bhcj0gcrnuk4edrud3.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('googleButton')!,
      {
        type: 'standard',
        size: 'large',
        theme: 'outline',
        text: 'signup_with',
        shape: 'rectangle',
        logo_alignment: 'center',
        locale: 'es',
      }
    );
  }

  // --- Google Sign-In ---

  private handleCredentialResponse(response: any): void {
    const token = response.credential;
    this.authService.loginWithGoogle(token).subscribe({
      next: () => {
        this.ngZone.run(() => this.router.navigate(['/dashboard']));
      },
      error: err => {
        console.error('Error al iniciar sesión con Google.', err);
      }
    });
  }

  // --- Acciones del usuario ---

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateInputs()) return;

    this.isLoading = true;

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: response => {
        this.successMessage = response.message;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => this.handleRegisterError(err),
      complete: () => this.isLoading = false
    });
  }

  // --- Validaciones ---

  private validateInputs(): boolean {
    this.name = this.name.trim();
    this.email = this.email.trim();
    this.password = this.password.trim();
    this.confirmPassword = this.confirmPassword.trim();

    this.nameError = this.name.length < 3;
    this.emailError = !/^\S+@\S+\.\S+$/.test(this.email);
    this.passwordError = this.password.length < 6;
    this.passwordMismatch = this.password !== this.confirmPassword;

    return !(this.nameError || this.emailError || this.passwordError || this.passwordMismatch);
  }

  // --- Manejo de errores ---

  private handleRegisterError(error: any): void {
    if (error.status === 400) {
      this.errorMessage = 'El correo ya está registrado.';
    } else if (error.status === 0) {
      this.errorMessage = 'No se pudo conectar con el servidor.';
    } else {
      this.errorMessage = 'Error al registrar. Inténtalo más tarde.';
    }
  }
}
