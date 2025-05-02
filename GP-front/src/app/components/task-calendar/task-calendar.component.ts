import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { CalendarOptions } from '@fullcalendar/core';
import { ActivatedRoute} from '@angular/router';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-calendar',
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.scss']
})
export class TaskCalendarComponent implements OnInit {
  tasks: Task[] = [];
  calendarOptions!: CalendarOptions;
  projectId!: number;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.projectId).subscribe((data: Task[]) => {
      this.tasks = data.filter(t => t.due_date); // Solo tareas con fecha
      this.initCalendar();
    });
  }

  initCalendar(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      editable: true,
      events: this.tasks.map(task => ({
        id: task.id.toString(),
        title: task.title,
        date: task.due_date,
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
      eventDrop: this.onEventDrop.bind(this)
    };
  }

  onEventClick(info: any): void {
    const task = this.tasks.find(t => t.id === +info.event.id);
    if (task) {
      Swal.fire({
        title: task.title,
        html: `
          <p><strong>Estado:</strong> ${task.status}</p>
          <p><strong>Descripción:</strong> ${task.description || '-'}</p>
          <p><strong>Vencimiento:</strong> ${task.due_date}</p>
          <p><strong>Etiquetas:</strong> ${task.tags || '-'}</p>
          <p><strong>Prioridad:</strong> ${task.priority}</p>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#9c89b8',
        background: 'linear-gradient(135deg, #faf3dd, #fcd5ce)',
        color: '#5e4b56'
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
  
  
}
