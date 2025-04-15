// ProfileService handles retrieving and updating the user's profile, including profile image deletion.
//----
// Este servicio se encarga de obtener y actualizar el perfil del usuario, incluyendo la eliminación de la imagen de perfil.

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api/profile'; // Base URL for profile-related endpoints | URL base para endpoints relacionados con el perfil

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/api/user'); // Fetches basic user info | Obtiene información básica del usuario
  }

  getProfile(): Observable<any> {
    return this.http.get(this.apiUrl); // Fetches profile data | Obtiene los datos del perfil
  }

  updateProfile(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, data); // Sends profile update with form data | Envía los cambios del perfil con datos de formulario
  }

  deleteProfileImage(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-image`); // Deletes user's profile image | Elimina la imagen de perfil del usuario
  }
  
}
