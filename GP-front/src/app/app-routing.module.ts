import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent,
    children: [
      { path: 'projects', component: ProjectsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'projects', pathMatch: 'full' } // Redirigir a profile por defecto
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirigir a login por defecto
  { path: '**', redirectTo: 'login' } // Manejo de rutas no encontradas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
