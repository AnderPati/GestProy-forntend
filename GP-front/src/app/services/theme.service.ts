// ThemeService manages dark mode preference using Renderer2 to add or remove a CSS class from the body element.
// It also persists the theme state in localStorage and restores it on initialization.
//----
// Este servicio gestiona el modo oscuro usando Renderer2 para añadir o quitar una clase CSS del body.
// Además guarda la preferencia en localStorage y la aplica automáticamente al iniciar.

import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isDarkMode: boolean = false;
  

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === null) {
      // No hay nada en localStorage: activar dark mode por defecto
      this.isDarkMode = false;
      localStorage.setItem('darkMode', 'false'); // Guardamos la preferencia
    } else {
      this.isDarkMode = savedMode === 'true';
    }

    this.applyTheme(); // Applies the saved theme mode on service init | Aplica el modo guardado al iniciar el servicio
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme(); // Updates the DOM with the new theme | Cambia la clase del body según el nuevo modo
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode'); // Adds dark-mode class to body | Añade la clase dark-mode al body
    } else {
      this.renderer.removeClass(document.body, 'dark-mode'); // Removes dark-mode class | Quita la clase dark-mode
    }
  }

  getDarkModeStatus(): boolean {
    return this.isDarkMode; // Returns current dark mode status | Devuelve el estado actual del modo oscuro
  }
}
