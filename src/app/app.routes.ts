import { Routes } from '@angular/router';
import { authGuard, adminGuard, clienteGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'cliente',
    canActivate: [authGuard, clienteGuard],
    loadComponent: () =>
      import('./features/cliente/layout/cliente-layout.component').then(
        (m) => m.ClienteLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/cliente/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'clases',
        loadComponent: () =>
          import('./features/cliente/clases/lista-clases.component').then(
            (m) => m.ListaClasesComponent
          ),
      },
      {
        path: 'reservaciones',
        loadComponent: () =>
          import('./features/cliente/reservaciones/mis-reservaciones.component').then(
            (m) => m.MisReservacionesComponent
          ),
      },
      {
        path: 'membresia',
        loadComponent: () =>
          import('./features/cliente/membresia/mi-membresia.component').then(
            (m) => m.MiMembresiaComponent
          ),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/cliente/pagos/mis-pagos.component').then(
            (m) => m.MisPagosComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'clases',
        loadComponent: () =>
          import('./features/admin/clases/gestion-clases.component').then(
            (m) => m.GestionClasesComponent
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/usuarios/gestion-usuarios.component').then(
            (m) => m.GestionUsuariosComponent
          ),
      },
      {
        path: 'reservaciones',
        loadComponent: () =>
          import('./features/admin/reservaciones/gestion-reservaciones.component').then(
            (m) => m.GestionReservacionesComponent
          ),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/admin/pagos/gestion-pagos.component').then(
            (m) => m.GestionPagosComponent
          ),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/admin/reportes/reportes.component').then(
            (m) => m.ReportesComponent
          ),
      },
      {
        path: 'whatsapp',
        loadComponent: () =>
          import('./features/admin/whatsapp/whatsapp-log.component').then(
            (m) => m.WhatsappLogComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
