import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { ClasesService } from '../../../core/services/clases.service';

@Component({
  selector: 'app-gestion-reservaciones',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './gestion-reservaciones.component.html',
  styleUrl: './gestion-reservaciones.component.scss',
})
export class GestionReservacionesComponent {
  private auth = inject(AuthService);
  private reservacionesService = inject(ReservacionesService);
  private clasesService = inject(ClasesService);

  filtroEstado = signal('');
  mensaje = signal('');

  reservaciones = computed(() => {
    let lista = this.reservacionesService
      .getAll()
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    if (this.filtroEstado()) lista = lista.filter((r) => r.estado === this.filtroEstado());
    return lista;
  });

  getUsuario(id: string) {
    return this.auth.getById(id);
  }

  getClase(id: string) {
    return this.clasesService.getById(id);
  }

  cancelar(id: string): void {
    const res = this.reservacionesService.cancelar(id);
    this.mensaje.set(res.mensaje);
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  confirmar(id: string): void {
    this.reservacionesService.cambiarEstado(id, 'confirmada');
    this.mensaje.set('Reservación confirmada');
    setTimeout(() => this.mensaje.set(''), 2000);
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  getBadge(estado: string): string {
    const map: Record<string, string> = {
      confirmada: 'badge-success', pendiente: 'badge-warning',
      cancelada: 'badge-danger', completada: 'badge-primary',
    };
    return map[estado] ?? '';
  }
}
