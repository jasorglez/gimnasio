import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MembresiasService } from '../../../core/services/membresias.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { ClasesService } from '../../../core/services/clases.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private membresias = inject(MembresiasService);
  private reservaciones = inject(ReservacionesService);
  private clases = inject(ClasesService);

  usuario = this.auth.usuario;

  membresia = computed(() => {
    const u = this.usuario();
    if (!u) return null;
    return this.membresias.getByUsuario(u.id) ?? null;
  });

  misReservaciones = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.reservaciones.getByUsuario(u.id).filter((r) => r.estado !== 'cancelada').slice(0, 3);
  });

  clasesActivas = computed(() => this.clases.getActivas().slice(0, 4));

  diasRestantes = computed(() => {
    const m = this.membresia();
    if (!m) return 0;
    const diff = new Date(m.fechaVencimiento).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  porcentajeMembresiaUsada = computed(() => {
    const m = this.membresia();
    if (!m) return 0;
    const total = new Date(m.fechaVencimiento).getTime() - new Date(m.fechaInicio).getTime();
    const transcurrido = new Date().getTime() - new Date(m.fechaInicio).getTime();
    return Math.min(100, Math.round((transcurrido / total) * 100));
  });

  getClase(claseId: string) {
    return this.clases.getById(claseId);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}
