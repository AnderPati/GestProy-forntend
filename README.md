
# 📁 GestProy - Frontend (Angular)

Este repositorio contiene el **frontend Angular** de la aplicación **GestProy**, una plataforma para la gestión de proyectos, tareas y archivos personales.

> 🔗 Proyecto complementario del backend: [GestProy - Backend (Laravel)](https://github.com/AnderPati/GestProy-backend)

---

## 🛠️ Tecnologías

- **Angular 16+**
- **TypeScript**
- **RxJS**
- **SweetAlert2** (modales)
- **FullCalendar** (calendario de tareas)
- **CDK Drag & Drop** (kanban)
- **SCSS** con variables personalizables
- API integrada con **Laravel Sanctum**

---

## 🚀 Requisitos

- Node.js 18+
- Angular CLI `npm install -g @angular/cli`
- Tener el backend Laravel ejecutándose y el forntend llamando al api de este.

---

## ⚙️ Instalación

```bash
# Clona el repositorio
git clone https://github.com/usuario/GestProy-frontend.git

# Entra en la carpeta del proyecto
cd GestProy-frontend

# Instala las dependencias
npm install

# Ejecuta el servidor de desarrollo
ng serve
```

Accede en el navegador: `http://localhost:4200`

---

## 📚 Estructura de carpetas

```bash
src/
├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── project-detail/
│   │   ├── task-calendar/
│   │   ├── tasks/
│   │   └── project-files/
│   ├── models/
│   ├── services/
│   ├── interceptors/
│   └── app-routing.module.ts
```

---

## ✅ Funcionalidades principales

- Autenticación (registro, login, logout)
- Gestión de proyectos personales
- Tareas con estados, fechas, etiquetas, prioridad y drag & drop tipo **kanban**
- Centro de tareas general con múltiples filtros
- Calendario de tareas por proyecto (FullCalendar)
- Subida y gestión de archivos por proyecto y carpetas
- Vista previa de imágenes y PDFs
- Uso de almacenamiento limitado por cuenta
- Estadísticas de archivos
- Responsive y usable en dispositivos móviles

---

## 🔒 Autenticación y tokens

Este frontend utiliza **interceptor Angular** para añadir automáticamente el token de autenticación (`Bearer Token`) a las peticiones mediante Laravel Sanctum.

Asegúrate de tener `sanctum/csrf-cookie` disponible desde el backend correctamente.

---

## 🧪 Comandos útiles

```bash
# Formatear con prettier
npm run format

# Ejecutar el linter
ng lint

# Build para producción
ng build --configuration=production
```
