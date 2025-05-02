import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

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
      });
    });
  }

  countByStatus(status: string): number {
    return this.tasks.filter(t => t.status === status).length;
  }

  countArchived(): number {
    return this.tasks.filter(t => t.archived).length;
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
