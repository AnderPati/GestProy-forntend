import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  tasks: any[] = [];
  projectNames: string[] = [];
  groupedTasks: { [key: string]: any[] } = {};

  filters = {
    status: '',
    project_name: '',
    search: '',
    due_before: '',
    due_after: '',
    sort_by: '',
    sort_direction: ''
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.fetchTasks();

    this.taskService.getAllTasks().subscribe(data => {
      this.tasks = data;
      this.projectNames = [...new Set(this.tasks.map(task => task.project?.name))];
    });
  }

  get tasksGroupedByProject() {
    const grouped: { [project: string]: any[] } = {};
    for (const task of this.tasks) {
      const project = task.project?.name || 'Sin proyecto';
      if (!grouped[project]) {
        grouped[project] = [];
      }
      grouped[project].push(task);
    }
    return grouped;
  }

  tasksGroupedKeys() {
    return Object.keys(this.tasksGroupedByProject);
  }

  fetchTasks() {
    this.taskService.getAllTasks(this.filters).subscribe(data => {
      this.tasks = data;
      this.groupedTasks = this.groupTasksByProject(data);
    });
  }

  groupTasksByProject(tasks: any[]): { [key: string]: any[] } {
    const groups: { [key: string]: any[] } = {};
    for (const task of tasks) {
      const projectName = task.project_name || 'Sin Proyecto';
      if (!groups[projectName]) groups[projectName] = [];
      groups[projectName].push(task);
    }
    return groups;
  }

  applyFilters() {
    this.fetchTasks();
  }

  resetFilters() {
    this.filters = {
      status: '',
      project_name: '',
      search: '',
      due_before: '',
      due_after: '',
      sort_by: '',
      sort_direction: ''
    };
    this.fetchTasks();
  }

  toggleStatus(task: any) {
    const nextStatus = task.status === 'pendiente'
      ? 'en progreso'
      : task.status === 'en progreso'
      ? 'completado'
      : 'pendiente';
  
    const updated = { ...task, status: nextStatus };
    this.taskService.updateTask(task.id, updated).subscribe(() => this.fetchTasks());
  }
  
  editTask(task: any) {
    Swal.fire({
      title: 'Editar Tarea',
      position: 'top',
      html: this.getEditTaskFormHtml(task),
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      confirmButtonColor: '#294036',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#5a3a3a',
      background: '#a67c52',
      focusConfirm: false,
      customClass: {
        title: 'sa2Title',
      },
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value.trim();
        if (!title) {
          Swal.showValidationMessage('El título es obligatorio.');
          return false;
        }
  
        return {
          title,
          description: (document.getElementById('description') as HTMLInputElement).value,
          status: (document.getElementById('status') as HTMLSelectElement).value,
          due_date: (document.getElementById('due_date') as HTMLInputElement).value || null,
          tags: (document.getElementById('tags') as HTMLInputElement).value.trim() || null,
          priority: (document.getElementById('priority') as HTMLSelectElement).value
        };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const updatedTask = { ...task, ...result.value };
  
        this.taskService.updateTask(task.id, updatedTask).subscribe(() => {
          this.fetchTasks();
          this.successToast();
        });
      }
    });
  }
  
  
  deleteTask(id: number) {
    Swal.fire({
      title: '¿Eliminar esta tarea?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          iconColor: '#fff',
          color: '#fff',
          position: 'top',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          confirmButtonColor: '#e63946',
          cancelButtonText: 'Cancelar',
          cancelButtonColor: '#4a7362',
          background: '#8c3b3b',
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(id).subscribe(() => {
          this.fetchTasks();
          this.successToast();
        });
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

  private getEditTaskFormHtml(task: any): string {
    const safe = (v: any) => String(v ?? '');
    const selected = (a: string, b: string) => a === b ? 'selected' : '';
    return `
      <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
          <label for="title" style="font-weight: bold; color: white;">Título: <span style="color: #f4a261;">*</span></label>
          <input id="title" type="text" class="swal2-input" value="${safe(task.title)}" required style="width: 100%; margin: 0; background: rgba(255, 255, 255, 0.2); color: black; border: 1.5px solid white; border-radius: 8px;">
  
          <label for="description" style="font-weight: bold; color: white; margin-top: 10px;">Descripción:</label>
          <textarea id="description" class="swal2-input"
            style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">${safe(task.description) || ''}</textarea>
  
          <label for="due_date" style="font-weight: bold; color: white; margin-top: 10px;">Fecha límite:</label>
          <input id="due_date" type="date" class="swal2-input" value="${safe(task.due_date) || ''}" style="margin: 0; padding: 10px; font-size: 1rem; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2); color: black;"/>
  
          <label for="tags" style="font-weight: bold; color: white; margin-top: 10px;">Etiquetas (separadas por comas):</label>
          <input id="tags" type="text" class="swal2-input" placeholder="Ej: frontend, urgente, bug" style="width: 100%; margin: 0; color: black; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2);" value="${safe(task.tags) || ''}">
  
          <label for="priority" style="font-weight: bold; color: white; margin-top: 10px;">Prioridad: <span style="color: #f4a261;">*</span></label>
          <select id="priority" class="swal2-select" style="border-radius: 8px; padding: 10px; width: 100%; margin: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">
            <option value="baja" ${selected(task.priority, 'baja')}>Baja</option>
            <option value="media" ${selected(task.priority, 'media')}>Media</option>
            <option value="alta" ${selected(task.priority, 'alta')}>Alta</option>
          </select>
  
          <label for="status" style="font-weight: bold; color: white; margin-top: 10px;">Estado: <span style="color: #f4a261;">*</span></label>
          <select id="status" class="swal2-select"
            style="border-radius: 8px; padding: 10px; width: 100%; margin: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">
            <option value="pendiente" ${selected(task.status, 'pendiente')}>Pendiente</option>
            <option value="en progreso" ${selected(task.status, 'en progreso')}>En Progreso</option>
            <option value="completado" ${selected(task.status, 'completado')}>Completado</option>
          </select>
        </div>
    `;
}
}
