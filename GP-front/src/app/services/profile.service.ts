import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return this.http.get(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateProfile(data: FormData): Observable<any> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return this.http.post(`${this.apiUrl}/update`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteProfileImage(): Observable<any> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return this.http.delete(`${this.apiUrl}/delete-image`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  
}
