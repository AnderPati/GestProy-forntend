import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  nameError: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  passwordMismatch: boolean = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle('Registro');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validateInputs(): boolean {
    this.name = this.name.trim(); // Eliminar espacios al inicio y final
    this.email = this.email.trim();
    this.password = this.password.trim();
    this.confirmPassword = this.confirmPassword.trim();
  
    this.nameError = this.name.length < 3;
    this.emailError = !/^\S+@\S+\.\S+$/.test(this.email);
    this.passwordError = this.password.length < 6;
    this.passwordMismatch = this.password !== this.confirmPassword;
  
    return !(this.nameError || this.emailError || this.passwordError || this.passwordMismatch);
  }
  

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateInputs()) {
      return; // No enviar la solicitud si hay errores
    }

    this.isLoading = true;

    this.authService.register(this.name, this.email, this.password).subscribe(
      response => {
        this.successMessage = response.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error => {
        if (error.status === 400) {
          this.errorMessage = 'El correo ya está registrado.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
        } else {
          this.errorMessage = 'Error al registrar. Inténtalo más tarde.';
        }
      }
    ).add(() => {
      this.isLoading = false;
    });
  }
}
