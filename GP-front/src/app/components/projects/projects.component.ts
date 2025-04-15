import { Component, OnInit, HostListener } from '@angular/core';
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
  
  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit() {
    const savedView = localStorage.getItem('projectsView');
    if (savedView !== null) {
      this.isGridView = savedView === 'grid';
    }
    this.loadProjects();
  }
  filteredProjects(): any[] {
    console.log(this.projects.filter(project => 
      (this.filterName === '' || project.name.toLowerCase().includes(this.filterName.toLowerCase())) &&
      (this.filterStatus === '' || project.status === this.filterStatus)
    ));
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
    this.projectService.getProjects().subscribe(
      data => {
        this.projects = data;
      },
      () => {
        Swal.fire('Error', 'No se pudieron cargar los proyectos.', 'error');
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
      background: 'linear-gradient(135deg, #faf3dd, #fcd5ce)',
      position: 'top',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      confirmButtonColor: '#9c89b8',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#5e4b56',
      inputValidator: (value) => {
        return value ? null : 'El nombre del proyecto es obligatorio';
      }
    });
  
    if (!name) return;
  
    const { value: formValues } = await Swal.fire({
      title: name,
      allowOutsideClick: false,
      position: 'top',
      html: `
        <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
          <label for="description" style="font-weight: bold; color: #5e4b56;">Descripción:</label>
          <textarea id="description" class="swal2-input" placeholder="Descripción del proyecto"
            style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255, 255, 255, 0.2); color: #333; transition: border 0.3s ease-in-out;"></textarea>
  
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <div>
              <label for="start_date" style="font-weight: bold; color: #5e4b56;">Fecha de inicio: <span style="color: #f4a261;">*</span></label>
              <input type="date" id="start_date" class="swal2-input"
              style="margin: 0; width: 100%;  border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255,255,255,0.2); color: #333; margin-bottom: 10px;" required>
            </div>
            <div>
              <label for="end_date" style="font-weight: bold; color: #5e4b56;">Fecha de fin:</label>
              <input type="date" id="end_date" class="swal2-input"
                style="margin: 0; width: 100%; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255,255,255,0.2); color: #333; margin-bottom: 10px;">
            </div>
          </div>
  
          <label for="status" style="font-weight: bold; color: #5e4b56;">Estado: <span style="color: #f4a261;">*</span></label>
          <select id="status" class="swal2-select"
            style="margin: 0; border-radius: 8px; padding: 10px; width: 100%; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255, 255, 255, 0.2); color: #333;">
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En Progreso</option>
            <option value="completado">Completado</option>
          </select>
          <span style="color: #5e4b56; margin-top: 10px; display: block; font-size: 0.8rem; text-align: left;">Los campos con * son obligatorios.</span>
        </div>
      `,
      background: 'linear-gradient(135deg, #faf3dd, #fcd5ce)',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Proyecto',
      confirmButtonColor: '#9c89b8',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#5e4b56',
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
        Swal.fire({
          title: response.message,
          color: '#5e4b56',
          icon: 'success',
          iconColor: '#5e4b56',
          background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        this.loadProjects();
      },
      () => {
        Swal.fire('Error', 'No se pudo crear el proyecto.', 'error');
      }
    );
  }  

  async editProject(project: any) {
    const { value: name } = await Swal.fire({
      title: 'Editar Nombre',
      input: 'text',
      inputValue: project.name,
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
      background: 'linear-gradient(135deg, #faf3dd, #fcd5ce)',
      position: 'top',
      inputValidator: (value) => {
          return value ? null : 'El nombre no puede estar vacío';
      }
    });

    if (!name) return;

    const { value: formValues } = await Swal.fire({
      title: name,
      html: `
      <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
          <label for="description" style="font-weight: bold; color: #5e4b56;">Descripción:</label>
          <textarea id="description" class="swal2-input" placeholder="Descripción del proyecto"
            style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255, 255, 255, 0.2); color: #333; transition: border 0.3s ease-in-out;">${project.description || ''}</textarea>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
          <div>
            <label for="start_date" style="font-weight: bold; color: #5e4b56;">Fecha de inicio: <span style="color: #f4a261;">*</span></label>
            <input type="date" id="start_date" class="swal2-input" value="${project.start_date || ''}"
            style="margin: 0; width: 100%;  border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255,255,255,0.2); color: #333; margin-bottom: 10px;" required>
          </div>
          <div>
            <label for="end_date" style="font-weight: bold; color: #5e4b56;">Fecha de fin:</label>
            <input type="date" id="end_date" class="swal2-input" value="${project.end_date || ''}"
              style="margin: 0; width: 100%; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255,255,255,0.2); color: #333; margin-bottom: 10px;">
          </div>
        </div>
          <label for="status" style="font-weight: bold; color: #5e4b56; margin-top: 15px;">Estado: <span style="color: #f4a261;">*</span></label>
          <select id="status" class="swal2-select"
            style="border-radius: 8px; padding: 10px; width: 100%; margin-left: 0; margin-top: 0; font-size: 1rem; border: 1.5px solid #5e4b56; background: rgba(255, 255, 255, 0.2); color: #333; transition: border 0.3s ease-in-out;">
            <option value="pendiente" ${project.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en progreso" ${project.status === 'en progreso' ? 'selected' : ''}>En Progreso</option>
            <option value="completado" ${project.status === 'completado' ? 'selected' : ''}>Completado</option>
          </select>
          <span style="color: #5e4b56; margin-top: 10px; display: block; font-size: 0.8rem; text-align: left;">Los campos con * son obligatorios.</span>
        </div>
      `,
      background: 'linear-gradient(135deg, #faf3dd, #fcd5ce)',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Proyecto',
      cancelButtonText: 'Cancelar',
      position: 'top',
      preConfirm: () => {
        const startDate = (document.getElementById('start_date') as HTMLInputElement).value;
        const endDate = (document.getElementById('end_date') as HTMLInputElement).value;
  
        if (!startDate) {
          Swal.showValidationMessage('La fecha de inicio es obligatoria');
          return false;
        }
  
        return {
          description: (document.getElementById('description') as HTMLInputElement).value,
          start_date: startDate,
          end_date: endDate || null,
          status: (document.getElementById('status') as HTMLSelectElement).value
        };
      }
    });

    if (!formValues) return;

    const updatedProject = {
      id: project.id,
      name,
      description: formValues.description,
      start_date: formValues.start_date,
      end_date: formValues.end_date,
      status: formValues.status
    };

    this.projectService.updateProject(project.id, updatedProject).subscribe(
      response => {
        Swal.fire({
          title: response.message,
          color: '#5e4b56',
          icon: 'success',
          iconColor: '#5e4b56',
          background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
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
      background: 'rgba(0, 0, 0, 0.7)',
      color: "white",
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      position: 'top'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(id).subscribe(
          response => {
            Swal.fire({
              title: "Proyecto Eliminado",
              color: '#5e4b56',
              icon: 'success',
              iconColor: '#5e4b56',
              background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
            this.loadProjects();
          },
          () => {
            Swal.fire('Error', 'No se pudo eliminar el proyecto.', 'error');
          }
        );
      }
    });
  }
}
