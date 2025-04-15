// ProjectService handles CRUD operations for projects.
//----
// Este servicio gestiona operaciones CRUD para proyectos.

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://127.0.0.1:8000/api/projects'; // Base URL for project endpoints | URL base para los endpoints de proyectos

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any> {
    return this.http.get(this.apiUrl); // Fetches all projects | Obtiene todos los proyectos
  }

  getProject(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`); // Fetches a single project by ID | Obtiene un proyecto específico por su ID
  }

  createProject(project: any): Observable<any> {
    return this.http.post(this.apiUrl, project); // Sends data to create a new project | Envía los datos para crear un nuevo proyecto
  }

  updateProject(id: number, project: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, project); // Updates project data by ID | Actualiza los datos del proyecto por su ID
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`); // Deletes a project by ID | Elimina un proyecto por su ID
  }
}
