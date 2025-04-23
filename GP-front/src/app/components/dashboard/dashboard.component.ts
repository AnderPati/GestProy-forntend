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
  isCollapsed: boolean = false; // Estado actual del sidebar (colapsado o no)
  isMobileOpen: boolean = false; // Controla si el menú móvil está abierto
  wasCollapsed: boolean = this.isCollapsed; // Recuerda el estado antes de entrar a móvil
  lastWindowWidth: number = window.innerWidth; // Guarda el ancho anterior de la ventana
  activeRoute: string = ''; // Ruta activa en el router
  isDarkMode: boolean = false; // Tema actual (oscuro o claro)

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.getDarkModeStatus(); // Carga el tema inicial (oscuro o claro)
    
    this.activeRoute = this.router.url; // Obtiene la ruta activa al iniciar

    // Actualiza la ruta activa cuando cambia la navegación
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.url;
      }
    });

    // Carga el estado del sidebar guardado (si existe)
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = JSON.parse(savedState);
      this.wasCollapsed = this.isCollapsed; // Lo usamos para restaurar después del modo móvil
    }

    // Validar existencia de token
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']); // Redirige si no hay token
      return;
    }

    // Validar token con el backend
    this.http.get('http://127.0.0.1:8000/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(
      () => {}, // Token válido: no se hace nada
      () => {
        // Token inválido: cerrar sesión y redirigir
        this.authService.removeToken();
        this.router.navigate(['/login']);
      }
    );

    this.handleResize(); // Ajusta el estado inicial según el tamaño de la ventana
    window.addEventListener('resize', this.handleResize.bind(this)); // Escucha cambios de tamaño
  }

  toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.isMobileOpen = !this.isMobileOpen; // Toggle para menú móvil
    } else {
      this.isCollapsed = !this.isCollapsed; // Cambia estado de sidebar en escritorio
      this.wasCollapsed = this.isCollapsed; // Guarda nuevo estado
      localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed)); // Persiste en localStorage
    }
  }

  closeMobileSidebar() {
    this.isMobileOpen = false; // Cierra el menú móvil (usado al navegar)
  }

  handleResize() {
    const isMobile = window.innerWidth <= 768;
    const wasMobile = this.lastWindowWidth <= 768;
  
    if (!wasMobile && isMobile) {
      // Cambio de escritorio a móvil: guarda estado anterior y fuerza sidebar expandido
      this.wasCollapsed = this.isCollapsed;
      this.isCollapsed = false;
    }
  
    if (wasMobile && !isMobile) {
      // Cambio de móvil a escritorio: restaura estado anterior
      this.isCollapsed = this.wasCollapsed;
    }
  
    this.lastWindowWidth = window.innerWidth; // Actualiza ancho actual
  }

  logout() {
    // Cierra sesión y limpia token
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
