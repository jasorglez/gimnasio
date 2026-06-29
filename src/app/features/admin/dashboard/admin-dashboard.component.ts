import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClasesService } from '../../../core/services/clases.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { MembresiasService } from '../../../core/services/membresias.service';
import { PagosService } from '../../../core/services/pagos.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private auth = inject(AuthService);
  private clases = inject(ClasesService);
  private reservaciones = inject(ReservacionesService);
  private membresias = inject(MembresiasService);
  private pagos = inject(PagosService);

  usuario = this.auth.usuario;

  stats = computed(() => {
    const allUsers = this.auth.getUsuariosPublicos().filter((u) => u.rol === 'cliente');
    const allClases = this.clases.getAll();
    const allRes = this.reservaciones.getAll();
    const pagosPend = this.pagos.getPendientes();
    const total = this.pagos.totalRecaudado();

    return {
      clientes: allUsers.length,
      clases: allClases.filter((c) => c.activa).length,
      reservaciones: allRes.filter((r) => r.estado !== 'cancelada').length,
      pagosPendientes: pagosPend.length,
      totalRecaudado: total,
      membresiastActivas: this.membresias.getAll().filter((m) => m.estado === 'activa').length,
    };
  });

  ultimasReservaciones = computed(() => {
    return this.reservaciones.getAll().slice(-5).reverse();
  });

  pagosPendientes = computed(() => this.pagos.getPendientes().slice(0, 5));

  clasesConMenosCupos = computed(() => {
    return this.clases
      .getActivas()
      .sort((a, b) => a.cuposDisponibles - b.cuposDisponibles)
      .slice(0, 4);
  });

  getClase(id: string) {
    return this.clases.getById(id);
  }

  getUsuario(id: string) {
    return this.auth.getById(id);
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }
}
