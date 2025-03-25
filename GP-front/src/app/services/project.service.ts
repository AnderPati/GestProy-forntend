import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://127.0.0.1:8000/api/projects';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getProjects(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  getProject(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createProject(project: any): Observable<any> {
    return this.http.post(this.apiUrl, project, { headers: this.getHeaders() });
  }

  updateProject(id: number, project: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, project, { headers: this.getHeaders() });
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
