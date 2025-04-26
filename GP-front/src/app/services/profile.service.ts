// ProfileService handles retrieving and updating the user's profile, including profile image deletion.
//----
// Este servicio se encarga de obtener y actualizar el perfil del usuario, incluyendo la eliminación de la imagen de perfil.

import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private api = 'http://127.0.0.1:8000/api'; // Base URL for profile-related endpoints | URL base para endpoints relacionados con el perfil

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get(`${this.api}/user`); // Fetches basic user info | Obtiene información básica del usuario
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/profile`); // Fetches profile data | Obtiene los datos del perfil
  }

  updateProfile(data: FormData): Observable<any> {
    return this.http.post(`${this.api}/profile/update`, data); // Sends profile update with form data | Envía los cambios del perfil con datos de formulario
  }

  deleteProfileImage(): Observable<any> {
    return this.http.delete(`${this.api}/profile/delete-image`); // Deletes user's profile image | Elimina la imagen de perfil del usuario
  }
  
  getStorageUsage(): Observable<any> {
    return this.http.get(`${this.api}/profile/storage-usage`);
  }
}
