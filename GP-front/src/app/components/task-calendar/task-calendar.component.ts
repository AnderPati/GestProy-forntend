import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { CalendarOptions } from '@fullcalendar/core';
import { ActivatedRoute} from '@angular/router';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-task-calendar',
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.scss']
})
export class TaskCalendarComponent implements OnInit {
  tasks: Task[] = [];
  calendarOptions!: CalendarOptions;
  projectId!: number;
  isLoading: boolean = false;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks(this.projectId).subscribe({
      next: (data: Task[]) => {
        this.tasks = data.filter(t => t.due_date);
        this.initCalendar();
      },
      error: () => {},
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  initCalendar(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      editable: true,
      firstDay: 1,
      locale: esLocale,
      events: this.tasks.map(task => ({
        id: task.id.toString(),
        title: task.title,
        date: task.due_date,
        priority: task.priority,
        backgroundColor:
          task.status === 'completado'
            ? '#66bb6a'
            : task.due_date && new Date(task.due_date) < new Date()
            ? '#e63946'
            : task.status === 'en progreso'
            ? '#ffb300'
            : '#ec407a'

      })),
      eventClick: this.onEventClick.bind(this),
      eventDrop: this.onEventDrop.bind(this),
      eventDidMount: (info) => {
        const tooltip = `${info.event.title}\nPrioridad: ${info.event.extendedProps['priority']}`;
        info.el.setAttribute('title', tooltip);
      }
    };
  }

  onEventClick(info: any): void {
    const task = this.tasks.find(t => t.id === +info.event.id);
    if (task) {
      Swal.fire({
        title: task.title,
        html: `
          <div style="text-align: left;">
            <p><strong>Estado:</strong> ${task.status}</p>
            <p><strong>Descripción:</strong> ${task.description || '-'}</p>
            <p><strong>Vencimiento:</strong> ${this.formatDateToSpanish(task.due_date)}</p>
            <p><strong>Etiquetas:</strong> ${task.tags || '-'}</p>
            <p><strong>Prioridad:</strong> ${task.priority}</p>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-backdrop'
        },
      });
    }
  }

  onEventDrop(info: any): void {
    const taskId = +info.event.id;
    const newDate = info.event.startStr;
  
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
  
    const updatedTask = {
      title: task.title,
      status: task.status,
      description: task.description,
      tags: task.tags,
      priority: task.priority,
      due_date: newDate
    };
  
    this.taskService.updateTask(taskId, updatedTask).subscribe(() => {
      // 🔄 Actualiza la propiedad visual del evento en el calendario
      const today = new Date();
      const movedDate = new Date(newDate);
  
      if (task.status !== 'completado' && movedDate < today) {
        info.event.setProp('backgroundColor', '#e63946'); // rojo si está atrasada
      } else {
        const color =
          task.status === 'pendiente'
            ? '#ec407a'
            : task.status === 'en progreso'
            ? '#ffb300'
            : '#66bb6a';
  
        info.event.setProp('backgroundColor', color);
      }
  
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
    });
  }
  
  formatDateToSpanish(dateStr?: string): string {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
