import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import Swal from 'sweetalert2';

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
  upcomingTasks: Task[] = [];
  showNotificationIcon: boolean = false;
  notificationClosed: boolean = false;
  pendingTasksCount: number = 0;
  pendingTasksHtml: string = '';
  refreshInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private themeService: ThemeService,
    private taskService: TaskService
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

    this.getUpcomingTasks(true); // Obtiene tareas próximas a vencer
    // Refrescar cada 5 minutos
    setInterval(() => {
      this.getUpcomingTasks();
    }, 60000);
    
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
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

  getUpcomingTasks(initial = false) {
    this.taskService.getUpcomingTasks().subscribe((tasks: any[]) => {
      if (!tasks || tasks.length === 0) {
        this.pendingTasksCount = 0;
        this.pendingTasksHtml = '';
        return;
      }
  
      this.pendingTasksCount = tasks.length;
  
      const grouped = tasks.reduce((acc: any, task) => {
        const projectName = task.project?.name || 'Sin proyecto';
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(task);
        return acc;
      }, {});
  
      const formatDateToSpanish = (dateStr?: string): string => {
        if (!dateStr) return 'Fecha no disponible';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
  
      this.pendingTasksHtml = Object.entries(grouped).map(([projectName, tasks]) => {
        const taskItems = (tasks as Task[]).map((task: Task) => `
          <div style="padding: 6px 0; border-top: 1px solid rgba(127, 127, 127, 0.3);">
            <strong>${task.title}</strong><br>
            <small style="color:rgb(183, 183, 183);">
              Vence el <em>${formatDateToSpanish(task.due_date)}</em>
            </small>
          </div>
        `).join('');
  
        return `
          <div style="margin-bottom: 18px; padding: 10px; background: rgba(0, 0, 0, 0.7); border: 1px solid rgba(0, 0, 0, 0.7); border-radius: 5px;">
            <div style="font-weight: bold; font-size: 24px; margin-bottom: 8px;">
              <i class="fa-solid fa-bookmark" style="color: #2a52be;"></i> ${projectName}
            </div>
            ${taskItems}
          </div>
        `;
      }).join('');
  
      if (initial && !this.notificationClosed) {
        Swal.fire({
          title: `<i class="fa-solid fa-bell fa-lg" style="color: gold;"></i> ${tasks.length} tareas próximas a vencer`,
          toast: true,
          position: 'bottom-end',
          showCloseButton: true,
          showConfirmButton: true,
          confirmButtonText: 'Ver detalles',
          customClass: {
            popup: 'swal-upcoming',
            confirmButton: 'swal-upcoming-confirm-custom',
          }
        }).then(result => {
          if (result.isConfirmed) {
            Swal.fire({
              title: 'Tareas próximas a vencer',
              html: this.pendingTasksHtml,
              icon: 'info',
              width: '600px',
              color: 'white',
              showCloseButton: true,
              showConfirmButton: false,
              customClass: {
                popup: 'swal-backdrop'
              }
            });
          }
          this.notificationClosed = true;
        });
      }
    });
  }

  showNotificationDetails() {
    Swal.fire({
      title: 'Tareas próximas a vencer',
      html: this.pendingTasksHtml,
      position: 'bottom-end',
      icon: 'info',
      width: '600px',
      color: 'white',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-backdrop'
      },
      showClass: {
        popup: 'swal-custom-show'
      },
      hideClass: {
        popup: 'swal-custom-hide'
      }
    });
  }
}
