// TaskService manages task-related operations: retrieving tasks for a project, individual task CRUD, etc.
//----
// Este servicio gestiona operaciones relacionadas con tareas: obtener tareas de un proyecto, y hacer CRUD de tareas individuales.

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://127.0.0.1:8000/api'; // Base API URL | URL base de la API

  constructor(private http: HttpClient) {}

  getTasks(projectId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/projects/${projectId}/tasks`); // Get all tasks for a given project | Obtiene todas las tareas de un proyecto
  }

  getAllTasks(filters: any = {}): Observable<any[]> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<any[]>(`${this.baseUrl}/tasks`, { params });
  }

  getUpcomingTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks/upcoming`);
  }

  createTask(projectId: number, task: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/projects/${projectId}/tasks`, task); // Creates a new task under a project | Crea una nueva tarea dentro de un proyecto
  }

  getTask(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/tasks/${id}`); // Fetch a single task by ID | Obtiene una tarea concreta por ID
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${id}`, task); // Updates a task by ID | Actualiza una tarea por ID
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${id}`); // Deletes a task by ID | Elimina una tarea por ID
  }
}
