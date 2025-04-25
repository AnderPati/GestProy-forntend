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

  uploadFile(projectId: number, file: File, folderId: number | null = null): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder_id', folderId.toString());
    }
    return this.http.post(`${this.api}/projects/${projectId}/files`, formData);
  }

  updateFileFolder(fileId: number, folderId: number) {
    return this.http.put(`${this.api}/files/${fileId}`, { folder_id: folderId });
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.api}/files/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  getFolders(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/projects/${projectId}/folders`);
  }

  createFolder(projectId: number, name: string): Observable<any> {
    return this.http.post<any>(`${this.api}/projects/${projectId}/folders`, { name });
  }

  renameFolder(projectId: number, folderId: number, newName: string) {
    return this.http.put(`${this.api}/projects/${projectId}/folders/${folderId}`, { name: newName });
  }

  deleteFolder(projectId: number, folderId: number): Observable<any> {
    return this.http.delete(`${this.api}/projects/${projectId}/folders/${folderId}`);
  }

  downloadFolder(folderId: number): Observable<Blob> {
    return this.http.get(`${this.api}/folders/${folderId}/download`, {
      responseType: 'blob'
    });
  }

  deleteFile(fileId: number): Observable<any> {
    return this.http.delete(`${this.api}/files/${fileId}`);
  }
}
