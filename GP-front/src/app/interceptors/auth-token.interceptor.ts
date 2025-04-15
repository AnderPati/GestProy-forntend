// This interceptor checks if there's a token in localStorage or sessionStorage
// and attaches it as a Bearer token to the Authorization header for outgoing requests.
//----
// Este interceptor revisa si hay un token en localStorage o sessionStorage
// y lo agrega como token Bearer al header Authorization para las peticiones salientes.

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'); // Looks for token in both storage options | Busca el token en ambas opciones de almacenamiento

    if (token) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned); // If token exists, send request with auth header | Si hay token, manda la petición con header de autenticación
    }

    return next.handle(request); // If no token, just forward the original request | Si no hay token, solo pasa la petición original
  }
  
}
