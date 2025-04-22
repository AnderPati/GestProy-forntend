import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getFiles(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/projects/${projectId}/files`);
  }

  uploadFile(projectId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/projects/${projectId}/files`, formData);
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.api}/files/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  deleteFile(fileId: number): Observable<any> {
    return this.http.delete(`${this.api}/files/${fileId}`);
  }
}
