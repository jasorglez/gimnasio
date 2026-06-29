import { Component, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = this.auth.usuario;
  sidebarOpen = signal(false);

  iniciales = computed(() => {
    const u = this.usuario();
    if (!u) return 'A';
    return (u.nombre[0] + u.apellido[0]).toUpperCase();
  });

  menu = [
    { label: 'Dashboard', icon: '📊', route: '/admin' },
    { label: 'Clases', icon: '🏋️', route: '/admin/clases' },
    { label: 'Usuarios', icon: '👥', route: '/admin/usuarios' },
    { label: 'Reservaciones', icon: '📅', route: '/admin/reservaciones' },
    { label: 'Pagos', icon: '💳', route: '/admin/pagos' },
    { label: 'Reportes', icon: '📈', route: '/admin/reportes' },
    { label: 'WhatsApp', icon: '💬', route: '/admin/whatsapp' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
