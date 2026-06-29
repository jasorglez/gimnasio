import { Component, inject, computed, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { ClasesService } from '../../../core/services/clases.service';
import { Reservacion } from '../../../core/models/reservacion.model';

@Component({
  selector: 'app-mis-reservaciones',
  standalone: true,
  imports: [],
  templateUrl: './mis-reservaciones.component.html',
  styleUrl: './mis-reservaciones.component.scss',
})
export class MisReservacionesComponent {
  private auth = inject(AuthService);
  private reservacionesService = inject(ReservacionesService);
  private clasesService = inject(ClasesService);

  usuario = this.auth.usuario;
  cancelando = signal('');
  mensaje = signal('');

  reservaciones = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.reservacionesService
      .getByUsuario(u.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  });

  proximas = computed(() => this.reservaciones().filter((r) => r.estado !== 'cancelada' && new Date(r.fecha) >= new Date()));
  pasadas = computed(() => this.reservaciones().filter((r) => r.estado === 'cancelada' || new Date(r.fecha) < new Date()));

  getClase(claseId: string) {
    return this.clasesService.getById(claseId);
  }

  cancelar(r: Reservacion): void {
    if (!confirm('¿Cancelar esta reservación?')) return;
    this.cancelando.set(r.id);
    const u = this.usuario();
    const res = this.reservacionesService.cancelar(r.id, u?.id);
    this.cancelando.set('');
    this.mensaje.set(res.mensaje);
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  esFutura(fecha: string): boolean {
    return new Date(fecha) >= new Date();
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      confirmada: 'badge-success',
      pendiente: 'badge-warning',
      cancelada: 'badge-danger',
      completada: 'badge-primary',
    };
    return map[estado] ?? 'badge-primary';
  }
}
