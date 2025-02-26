import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GP-front';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getTestData().subscribe(response => {
      console.log('Respuesta del backend:', response);
    }, error => {
      console.error('Error en la conexión:', error);
    });
  }
}
