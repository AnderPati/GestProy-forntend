import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isCollapsed: boolean = false;
  activeRoute: string = '';

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Obtener la ruta actual al iniciar la página
    this.activeRoute = this.router.url;

    // Escuchar cambios en la navegación para actualizar la ruta activa
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.url;
      }
    });

    // Leer el estado del sidebar desde localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = JSON.parse(savedState);
    }

    // Verificar si el token es válido
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']); // No hay token, redirigir al login
      return;
    }

    // Hacer una solicitud al backend para validar el token
    this.http.get('http://127.0.0.1:8000/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(
      () => {
        // Token válido, continuar en el dashboard
      },
      () => {
        // Token inválido, redirigir al login
        this.authService.removeToken();
        this.router.navigate(['/login']);
      }
    );
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed));
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.authService.removeToken();
      this.router.navigate(['/login']);
    });
  }
}
