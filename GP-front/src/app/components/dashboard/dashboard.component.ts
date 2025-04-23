import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isCollapsed: boolean = false;
  isMobileOpen: boolean = false;
  wasCollapsed: boolean = this.isCollapsed;
  lastWindowWidth: number = window.innerWidth;
  activeRoute: string = '';
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.getDarkModeStatus();
    
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
      this.wasCollapsed = this.isCollapsed; // Muy importante
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

    this.handleResize(); // Ajustar estado al iniciar
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
      this.wasCollapsed = this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed));
    }
  }

  closeMobileSidebar() {
    this.isMobileOpen = false;
  }

  handleResize() {
    const isMobile = window.innerWidth <= 768;
    const wasMobile = this.lastWindowWidth <= 768;
  
    if (!wasMobile && isMobile) {
      // Entrando a móvil: guarda el estado actual y fuerza expandido
      this.wasCollapsed = this.isCollapsed;
      this.isCollapsed = false;
    }
  
    if (wasMobile && !isMobile) {
      // Saliendo de móvil: restaura el estado anterior
      this.isCollapsed = this.wasCollapsed;
    }
  
    this.lastWindowWidth = window.innerWidth;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.authService.removeToken();
      this.router.navigate(['/login']);
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
    this.isDarkMode = this.themeService.getDarkModeStatus();
  }
}
