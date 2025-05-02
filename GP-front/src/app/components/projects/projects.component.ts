import { Component, OnInit, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  openMenu: number | null = null; // Controla qué menú desplegable está abierto
  filterName: string = '';
  filterStatus: string = '';
  projectStatuses: string[] = ['Pendiente', 'En Progreso', 'Completado']; // Ajusta según tus estados
  isGridView: boolean = false;
  isLoading: boolean = false;
  
  constructor(
    private titleService: Title,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Proyectos');
    const savedView = localStorage.getItem('projectsView');
    if (savedView !== null) {
      this.isGridView = savedView === 'grid';
    }
    this.loadProjects();
  }

  filteredProjects(): any[] {
    return this.projects.filter(project => 
      (this.filterName === '' || project.name.toLowerCase().includes(this.filterName.toLowerCase())) &&
      (this.filterStatus.toLowerCase() === '' || project.status === this.filterStatus.toLowerCase())
    );
  }

  toggleView() {
    this.isGridView = !this.isGridView;
    localStorage.setItem('projectsView', this.isGridView ? 'grid' : 'list');
  }

  loadProjects() {
    this.isLoading = true;
  
    this.projectService.getProjects().subscribe(
      data => {
        this.projects = data;
      },
      () => {
        Swal.fire('Error', 'No se pudieron cargar los proyectos.', 'error');
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pendiente': return 'status-pending';
      case 'en progreso': return 'status-in-progress';
      case 'completado': return 'status-completed';
      default: return '';
    }
  }

  goToProject(id: number) {
    this.router.navigate([`/dashboard/projects/${id}`]); // Navega al proyecto correspondiente
  }

  toggleMenu(event: Event, id: number) {
    event.stopPropagation(); // Evita que al hacer clic en el menú se active `goToProject`
    this.openMenu = this.openMenu === id ? null : id; // Alternar el menú
  }

  // Detectar clics en toda la página y cerrar el menú si el clic no es en el botón del menú ni en el menú mismo
  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.options-btn') && !target.closest('.dropdown-menu')) {
      this.openMenu = null;
    }
  }

  async createProject() {
    const { value: name } = await Swal.fire({
      title: 'Nombre del nuevo proyecto:',
      input: 'text',
      position: 'top',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      confirmButtonColor: '#38785c',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#693131',
      customClass: {
        popup: 'swal-backdrop'
      },
      inputValidator: (value) => {
        return value ? null : 'El nombre del proyecto es obligatorio';
      }
    });
  
    if (!name) return;
  
    const { value: formValues } = await Swal.fire({
      title: name,
      allowOutsideClick: false,
      position: 'top',
      html: this.getCreateContinueProjectFormHtml(),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Proyecto',
      confirmButtonColor: '#38785c',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#693131',
      customClass: {
        popup: 'swal-backdrop'
      },
      didOpen: () => {
        document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(input => {
          input.addEventListener('focus', () => input.showPicker?.());
        });
      },
      preConfirm: () => {
        const startDate = (document.getElementById('start_date') as HTMLInputElement).value;
        const endDate = (document.getElementById('end_date') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLInputElement).value;
        const status = (document.getElementById('status') as HTMLSelectElement).value;

        if (!startDate) {
          Swal.showValidationMessage('La fecha de inicio es obligatoria');
          return false;
        }

        if (endDate && new Date(endDate) < new Date(startDate)) {
          Swal.showValidationMessage('La fecha de fin no puede ser anterior a la fecha de inicio');
          return false;
        }

        return {
          description,
          start_date: startDate,
          end_date: endDate || null,
          status
        };
      }
    });
  
    if (!formValues) return;
  
    const newProject = {
      name,
      description: formValues.description,
      start_date: formValues.start_date,
      end_date: formValues.end_date,
      status: formValues.status
    };
  
    this.projectService.createProject(newProject).subscribe(
      response => {
        this.successToast();
        this.loadProjects();
      },
      () => {
        Swal.fire('Error', 'No se pudo crear el proyecto.', 'error');
      }
    );
  }  

  async editProject(project: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Proyecto',
      html: this.getEditProjectFormHtml(project),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Proyecto',
      confirmButtonColor: '#38785c',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#693131',
      position: 'top',
      customClass: {
        popup: 'swal-backdrop'
      },
      didOpen: () => {
        document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(input => {
          input.addEventListener('focus', () => input.showPicker?.());
        });
      },
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value.trim();
        const description = (document.getElementById('description') as HTMLInputElement).value;
        const startDate = (document.getElementById('start_date') as HTMLInputElement).value;
        const endDate = (document.getElementById('end_date') as HTMLInputElement).value;
        const status = (document.getElementById('status') as HTMLSelectElement).value;
  
        if (!name) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
          return false;
        }
  
        if (!startDate) {
          Swal.showValidationMessage('La fecha de inicio es obligatoria');
          return false;
        }
  
        return {
          name,
          description,
          start_date: startDate,
          end_date: endDate || null,
          status
        };
      }
    });
  
    if (!formValues) return;
  
    const updatedProject = {
      id: project.id,
      name: formValues.name,
      description: formValues.description,
      start_date: formValues.start_date,
      end_date: formValues.end_date,
      status: formValues.status
    };
  
    this.projectService.updateProject(project.id, updatedProject).subscribe(
      response => {
        this.successToast();
        this.loadProjects();
      },
      () => {
        Swal.fire('Error', 'No se pudo actualizar el proyecto.', 'error');
      }
    );
  }
  
  
  deleteProject(id: number) {
    Swal.fire({
      title: '¿Eliminar este proyecto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#693131',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#38785c',
      position: 'top',
      customClass: {
        popup: 'swal-backdrop'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(id).subscribe(
          response => {
            this.successToast();
            this.loadProjects();
          },
          () => {
            Swal.fire('Error', 'No se pudo eliminar el proyecto.', 'error');
          }
        );
      }
    });
  }
  
  successToast() {
      Swal.fire({
        toast: true,
        position: 'top',
        background: 'transparent',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          popup: 'custom-toast'
        }
      });
    }

  /*
  Método para obtener el HTML del formulario de creación de proyecto, continuación de proyecto y edición de proyecto.
  Se utiliza para mostrar el formulario en un modal de SweetAlert2.
  */

  private getCreateProjectFormHtml(): string {
  return `
    <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
      <label for="description" style="font-weight: bold; color: white;">Descripción:</label>
      <textarea id="description" class="swal2-input" style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white;"></textarea>

      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <div>
          <label for="start_date" style="font-weight: bold; color: white;">Fecha de inicio: <span style="color: #f4a261;">*</span></label>
          <input type="date" id="start_date" class="swal2-input" style="width: 100%; border-radius: 8px; padding: 10px; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white;">
        </div>
        <div>
          <label for="end_date" style="font-weight: bold; color: white;">Fecha de fin:</label>
          <input type="date" id="end_date" class="swal2-input" style="width: 100%; border-radius: 8px; padding: 10px; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white;">
        </div>
      </div>

      <label for="status" style="font-weight: bold; color: white;">Estado: <span style="color: #f4a261;">*</span></label>
      <select id="status" class="swal2-select" style="border-radius: 8px; padding: 10px; width: 100%; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white;">
        <option value="pendiente">Pendiente</option>
        <option value="en progreso">En Progreso</option>
        <option value="completado">Completado</option>
      </select>

      <span style="color: white; margin-top: 10px; display: block; font-size: 0.8rem; text-align: left;">Los campos con * son obligatorios.</span>
    </div>
  `;
}

private getCreateContinueProjectFormHtml(): string {
  return `
    <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
      <label for="description" style="font-weight: bold; color: white;">Descripción:</label>
      <textarea id="description" class="swal2-input"
        style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; transition: border 0.3s ease-in-out;"></textarea>

      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <div>
          <label for="start_date" style="font-weight: bold; color: white;">Fecha de inicio: <span style="color: #f4a261;">*</span></label>
          <input type="date" id="start_date" class="swal2-input"
          style="margin: 0; width: 100%;  border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; margin-bottom: 10px;" required>
        </div>
        <div>
          <label for="end_date" style="font-weight: bold; color: white;">Fecha de fin:</label>
          <input type="date" id="end_date" class="swal2-input"
            style="margin: 0; width: 100%; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; margin-bottom: 10px;">
        </div>
      </div>

      <label for="status" style="font-weight: bold; color: white;">Estado: <span style="color: #f4a261;">*</span></label>
      <select id="status" class="swal2-select"
        style="margin: 0; border-radius: 8px; padding: 10px; width: 100%; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white;">
        <option value="pendiente">Pendiente</option>
        <option value="en progreso">En Progreso</option>
        <option value="completado">Completado</option>
      </select>
      <span style="color: white; margin-top: 10px; display: block; font-size: 0.8rem; text-align: left;">Los campos con * son obligatorios.</span>
    </div>
  `;
}

private getEditProjectFormHtml(project: any): string {
  const safe = (val: any) => String(val ?? '');
  const selected = (val: string, opt: string) => val === opt ? 'selected' : '';
  return `
    <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
          <label for="name" style="font-weight: bold; color: white;">Nombre: <span style="color: #f4a261;">*</span></label>
          <input id="name" class="swal2-input" placeholder="Nombre del proyecto" value="${safe(project.name) || ''}"
            style="border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; transition: border 0.3s ease-in-out; width: 100%; margin-left: 0;">
  
          <label for="description" style="font-weight: bold; color: white; margin-top: 10px;">Descripción:</label>
          <textarea id="description" class="swal2-input" placeholder="Descripción del proyecto"
            style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; transition: border 0.3s ease-in-out;">${safe(project.description) || ''}</textarea>
  
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <div>
              <label for="start_date" style="font-weight: bold; color: white;">Fecha de inicio: <span style="color: #f4a261;">*</span></label>
              <input type="date" id="start_date" class="swal2-input" value="${safe(project.start_date) || ''}"
                style="margin: 0; width: 100%; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; margin-bottom: 10px;" required>
            </div>
            <div>
              <label for="end_date" style="font-weight: bold; color: white;">Fecha de fin:</label>
              <input type="date" id="end_date" class="swal2-input" value="${safe(project.end_date) || ''}"
                style="margin: 0; width: 100%; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; margin-bottom: 10px;">
            </div>
          </div>
  
          <label for="status" style="font-weight: bold; color: white; margin-top: 15px;">Estado: <span style="color: #f4a261;">*</span></label>
          <select id="status" class="swal2-select"
            style="border-radius: 8px; padding: 10px; width: 100%; margin-left: 0; margin-top: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(0, 0, 0, 0.5); color: white; transition: border 0.3s ease-in-out;">
            <option value="pendiente" ${selected(project.status, 'pendiente')} ? 'selected' : ''}>Pendiente</option>
            <option value="en progreso" ${selected(project.status, 'en progreso')}>En Progreso</option>
            <option value="completado" ${selected(project.status, 'completado')}>Completado</option>
          </select>
  
          <span style="color: white; margin-top: 10px; display: block; font-size: 0.8rem; text-align: left;">Los campos con * son obligatorios.</span>
        </div>
  `;
}

}
