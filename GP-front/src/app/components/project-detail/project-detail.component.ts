import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import Swal from 'sweetalert2';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  public projectId!: number;
  project: any;
  tasks: Task[] = [];
  tasksByStatus: { [key: string]: Task[] } = {
    pendiente: [],
    'en progreso': [],
    completado: []
  };
  dropListIds = ['pendiente', 'en progreso', 'completado'];
  showHeader: boolean = true;
  progressPercentage: number = 0;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('GestProy - Proyecto');
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProject();
    const saved = localStorage.getItem('showProjectHeader');
    this.showHeader = saved ? JSON.parse(saved) : true;
  }

  toggleHeader() {
    this.showHeader = !this.showHeader;
    localStorage.setItem('showProjectHeader', JSON.stringify(this.showHeader));
  }

  loadProject() {
    this.projectService.getProject(this.projectId).subscribe({
      next: data => {
        this.project = data;
        this.loadTasks();
        this.titleService.setTitle('GestProy - ' + this.project.name);
      },
      error: error => {
        if (error.status === 403) {
          this.router.navigate(['/dashboard/projects']);
          Swal.fire({
            toast: true,
            icon: 'question',
            title: 'Proyecto no encontrado',
            text: 'El proyecto que estás intentando buscar no existe.',
            position: 'top',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            iconColor: '#fff',
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
        }
      }
    });
  }

  loadTasks() {
    this.taskService.getTasks(this.projectId).subscribe((data: Task[]) => {
      this.tasks = data;
      this.tasksByStatus = {
        pendiente: data.filter((t: Task) => t.status === 'pendiente'),
        'en progreso': data.filter((t: Task) => t.status === 'en progreso'),
        completado: data.filter((t: Task) => t.status === 'completado')
      };
    
      const total = data.length;
      const completadas = data.filter(t => t.status === 'completado').length;
      this.progressPercentage = total > 0 ? Math.round((completadas / total) * 100) : 0;

      this.calculateProgress();
    });
  }

  calculateProgress(): void {
    const total = this.tasks.length;
    const completadas = this.tasks.filter(t => t.status === 'completado').length;
    this.progressPercentage = total > 0 ? Math.round((completadas / total) * 100) : 0;
  }

  async createTask() {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Tarea',
      allowOutsideClick: false,
      position: 'top',
      html: `
        <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
          <label for="title" style="font-weight: bold; color: white;">Título:  <span style="color: #f4a261;">*</span></label>
          <input id="title" type="text" class="swal2-input" required style="width: 100%; margin: 0; color: black; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2);">
  
          <label for="description" style="font-weight: bold; color: white; margin-top: 10px;">Descripción:</label>
          <textarea id="description" class="swal2-input"
            style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;"></textarea>
  
            
            <label for="due_date" style="font-weight: bold; color: white; margin-top: 10px;">Fecha de vencimiento:</label>
            <input id="due_date" type="date" class="swal2-input"
            style="margin: 0; padding: 10px; font-size: 1rem; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2); color: black;" />

            <label for="tags" style="font-weight: bold; color: white; margin-top: 10px;">Etiquetas (separadas por comas):</label>
            <input id="tags" type="text" class="swal2-input" placeholder="Ej: frontend, urgente, bug" style="width: 100%; margin: 0; color: black; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2);">

            <label for="priority" style="font-weight: bold; color: white; margin-top: 10px;">Prioridad: <span style="color: #f4a261;">*</span></label>
            <select id="priority" class="swal2-select" style="border-radius: 8px; padding: 10px; width: 100%; margin: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">
              <option value="baja">Baja</option>
              <option value="media" selected>Media</option>
              <option value="alta">Alta</option>
            </select>

            <label for="status" style="font-weight: bold; color: white; margin-top: 10px;">Estado: <span style="color: #f4a261;">*</span></label>
            <select id="status" class="swal2-select"
              style="border-radius: 8px; padding: 10px; width: 100%; margin: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </select>
        </div>
      `,
      background: '#4a7362',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Tarea',
      confirmButtonColor: '#294036',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#5a3a3a',
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
    });
  
    if (!formValues) return;

    console.log('Form values:', formValues);
  
    const newTask = {
      title: formValues.title,
      description: formValues.description,
      status: formValues.status,
      due_date: formValues.due_date,
      tags: formValues.tags,
      priority: formValues.priority,
      archived: false
    };
  
    this.taskService.createTask(this.projectId, newTask).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          iconColor: '#5e4b56',
          color: '#5e4b56',
          title: 'Tarea creada.',
          background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
        this.loadTasks();
      },
      () => {
        Swal.fire('Error', 'No se pudo crear la tarea.', 'error');
      }
    );
  }

  editTask(task: Task) {
    if (task.archived) {
      // Si está archivada, ofrecer desarchivar
      Swal.fire({
        title: '¿Quieres desarchivar esta tarea?',
        icon: 'question',
        iconColor: '#fff',
        showCancelButton: true,
        confirmButtonText: 'Desarchivar',
        confirmButtonColor: '#294036',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#5a3a3a',
        background: '#7a5c38',
        color: 'white'
      }).then(result => {
        if (result.isConfirmed) {
          const unarchivedTask = { ...task, archived: false };
          this.taskService.updateTask(task.id, unarchivedTask).subscribe(() => {
            this.loadTasks();
            Swal.fire({
              icon: 'info',
              iconColor: '#5e4b56',
              title: 'Tarea desarchivada',
              toast: true,
              position: 'top-end',
              background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
              color: '#5e4b56',
              showConfirmButton: false,
              timer: 2000
            });
          });
        }
      });
    }else{
      // Si no está archivada, proceder a editar
    Swal.fire({
      title: 'Editar Tarea',
      position: 'top',
      html: `
        <div style="display: flex; flex-direction: column; text-align: left; padding: 10px;">
          <label for="title" style="font-weight: bold; color: white;">Título: <span style="color: #f4a261;">*</span></label>
          <input id="title" type="text" class="swal2-input" value="${task.title}" required style="width: 100%; margin: 0; background: rgba(255, 255, 255, 0.2); color: black; border: 1.5px solid white; border-radius: 8px;">
  
          <label for="description" style="font-weight: bold; color: white; margin-top: 10px;">Descripción:</label>
          <textarea id="description" class="swal2-input"
            style="height: 80px; border-radius: 8px; padding: 10px; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">${task.description || ''}</textarea>
  
          <label for="due_date" style="font-weight: bold; color: white; margin-top: 10px;">Fecha límite:</label>
          <input id="due_date" type="date" class="swal2-input" value="${task.due_date || ''}" style="margin: 0; padding: 10px; font-size: 1rem; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2); color: black;"/>

          <label for="tags" style="font-weight: bold; color: white; margin-top: 10px;">Etiquetas (separadas por comas):</label>
          <input id="tags" type="text" class="swal2-input" placeholder="Ej: frontend, urgente, bug" style="width: 100%; margin: 0; color: black; border: 1.5px solid white; border-radius: 8px; background: rgba(255, 255, 255, 0.2);" value="${task.tags || ''}">

          <label for="priority" style="font-weight: bold; color: white; margin-top: 10px;">Prioridad: <span style="color: #f4a261;">*</span></label>
          <select id="priority" class="swal2-select" style="border-radius: 8px; padding: 10px; width: 100%; margin: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">
            <option value="baja" ${task.priority === 'baja' ? 'selected' : ''}>Baja</option>
            <option value="media" ${task.priority === 'media' ? 'selected' : ''}>Media</option>
            <option value="alta" ${task.priority === 'alta' ? 'selected' : ''}>Alta</option>
          </select>
  
          <label for="status" style="font-weight: bold; color: white; margin-top: 10px;">Estado: <span style="color: #f4a261;">*</span></label>
          <select id="status" class="swal2-select"
            style="border-radius: 8px; padding: 10px; width: 100%; margin: 0; font-size: 1rem; border: 1.5px solid white; background: rgba(255, 255, 255, 0.2); color: black;">
            <option value="pendiente" ${task.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en progreso" ${task.status === 'en progreso' ? 'selected' : ''}>En Progreso</option>
            <option value="completado" ${task.status === 'completado' ? 'selected' : ''}>Completado</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      showCloseButton: true,
      confirmButtonText: 'Guardar Cambios',
      denyButtonText: 'Archivar',
      cancelButtonText: 'Eliminar',
      confirmButtonColor: '#294036',
      denyButtonColor: '#5e4b56',
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
          this.loadTasks();
          Swal.fire({
            icon: 'success',
            iconColor: '#5e4b56',
            color: '#5e4b56',
            title: 'Tarea actualizada',
            toast: true,
            position: 'top-end',
            background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
            showConfirmButton: false,
            timer: 2000
          });
        });
  
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Confirmar antes de eliminar
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
        }).then(confirmDelete => {
          if (confirmDelete.isConfirmed) {
            this.taskService.deleteTask(task.id).subscribe(() => {
              this.loadTasks();
              Swal.fire({
                icon: 'success',
                iconColor: '#5e4b56',
                color: '#5e4b56',
                title: 'Tarea eliminada.',
                toast: true,
                position: 'top-end',
                background: 'linear-gradient(135deg,#f4a261, #9c89b8)',
                showConfirmButton: false,
                timer: 2000
              });
            });
          }
        });
      } else if (result.isDenied) {
        const archivedTask = {
          ...task, // datos actuales de la tarea
          archived: true // solo cambia esto
        };
      
        this.taskService.updateTask(task.id, archivedTask).subscribe(() => {
          this.loadTasks();
          Swal.fire({
            icon: 'info',
            iconColor: '#5e4b56',
            title: 'Tarea archivada',
            toast: true,
            position: 'top-end',
            background: 'linear-gradient(135deg, #f4a261, #9c89b8)',
            color: '#5e4b56',
            showConfirmButton: false,
            timer: 2000
          });
        });
      } 
    });
    }
  }
  

  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    const task = event.previousContainer.data[event.previousIndex];

    if (task.status !== newStatus) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      task.status = newStatus;
    } else {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

      event.container.data.forEach((t, index) => {
        const updatedTask = { ...t, position: index, status: t.status };
        this.taskService.updateTask(t.id, updatedTask).subscribe();
        this.calculateProgress();
      });
  }

  asTaskStatus(status: string): TaskStatus {
    return status as TaskStatus;
  }
}
