import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TaskCalendarComponent } from './components/task-calendar/task-calendar.component';
import { ProjectSummaryComponent } from './components/project-summary/project-summary.component';
import { ProjectFilesComponent } from './components/project-files/project-files.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { LandingComponent } from './components/landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'projects/:id/calendar', component: TaskCalendarComponent },
      { path: 'projects/:id/summary', component: ProjectSummaryComponent },
      { path: 'projects/:id/files', component: ProjectFilesComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'projects', pathMatch: 'full' } // Default redirect inside dashboard | Redirige a projects por defecto dentro de dashboard
    ]},
  { path: '', redirectTo: '', pathMatch: 'full' }, // Redirect root to login | Redirige raíz a login
  { path: '**', redirectTo: 'login' } // Route for unknown paths | Ruta para manejar rutas no encontradas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
