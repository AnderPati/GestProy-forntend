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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password, this.rememberMe).subscribe(
      response => {
        this.authService.saveToken(response.token, this.rememberMe);
        this.router.navigate(['/dashboard']); // Redirige tras el login
      },
      error => {
        this.errorMessage = 'Credenciales incorrectas';
      }
    );
  }
}
