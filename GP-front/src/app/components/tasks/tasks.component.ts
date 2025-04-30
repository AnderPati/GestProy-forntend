import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  tasks: any[] = [];
  projectNames: string[] = [];

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
    });
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
}
