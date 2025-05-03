import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {
  projectId!: number;
  project: any;
  tasks: Task[] = [];
  progress = 0;
  projectStorageUsed: number = 0;

  // Gráfico 1: Estado de tareas activas
  public statusChartLabels: string[] = ['Pendientes', 'En progreso', 'Completadas'];
  public statusChartData: number[] = [];
  public statusChartColors = ['#ec407a', '#ffb300', '#66bb6a'];

  // Gráfico 2: Activas vs Archivadas
  public archiveChartLabels: string[] = ['Activas', 'Archivadas'];
  public archiveChartData: number[] = [];
  public archiveChartColors = ['#2a52be', '#9e9e9e'];

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(127, 127, 127)',
          font: {
            size: 14
          }
        }
      }
    },
  };
  
  public chartType: ChartType = 'doughnut';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData(): void {
    this.projectService.getProject(this.projectId).subscribe(project => {
      this.project = project;

      this.taskService.getTasks(this.projectId).subscribe(tasks => {
        this.tasks = tasks;

        const total = tasks.length;
        const completadas: number = tasks.filter((t: Task) => t.status === 'completado').length;
        this.progress = total ? Math.round((completadas / total) * 100) : 0;

        // === Gráfico 1: solo tareas activas ===
        const pendientes = tasks.filter((t: Task) => t.status === 'pendiente').length;
        const enProgreso = tasks.filter((t: Task) => t.status === 'en progreso').length;
        const completadasEstado = tasks.filter((t: Task) => t.status === 'completado').length;
        this.statusChartData = [pendientes, enProgreso, completadasEstado];

        // === Gráfico 2: activas vs archivadas ===
        const activas = tasks.filter((t: Task) => !t.archived);
        const archivadas = tasks.filter((t: Task) => t.archived).length;
        this.archiveChartData = [activas.length, archivadas];
      });
    });
  }

  countByStatus(status: string): number {
    return this.tasks.filter(t => t.status === status).length;
  }

  countArchived(): number {
    return this.tasks.filter(t => t.archived).length;
  }

  getDaysLeft(): string | null {
    if (!this.project?.end_date) return null;
    const end = new Date(this.project.end_date);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Finalizado';
    if (diff === 0) return 'Último día';
    return `${diff} día(s) restante(s)`;
  }

  getProjectDuration(): number | null {
    if (!this.project?.start_date || !this.project?.end_date) return null;
    const start = new Date(this.project.start_date);
    const end = new Date(this.project.end_date);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
