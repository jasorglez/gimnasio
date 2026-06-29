import { Component, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.scss',
})
export class ClienteLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = this.auth.usuario;
  sidebarOpen = signal(false);

  iniciales = computed(() => {
    const u = this.usuario();
    if (!u) return '?';
    return (u.nombre[0] + u.apellido[0]).toUpperCase();
  });

  menu = [
    { label: 'Inicio', icon: '🏠', route: '/cliente' },
    { label: 'Clases', icon: '🏋️', route: '/cliente/clases' },
    { label: 'Mis Reservaciones', icon: '📅', route: '/cliente/reservaciones' },
    { label: 'Mi Membresía', icon: '⭐', route: '/cliente/membresia' },
    { label: 'Pagos', icon: '💳', route: '/cliente/pagos' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
