import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClasesService } from '../../../core/services/clases.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { MembresiasService } from '../../../core/services/membresias.service';
import { PagosService } from '../../../core/services/pagos.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent {
  private auth = inject(AuthService);
  private clases = inject(ClasesService);
  private reservaciones = inject(ReservacionesService);
  private membresias = inject(MembresiasService);
  private pagos = inject(PagosService);

  resumen = computed(() => {
    const clientes = this.auth.getUsuariosPublicos().filter((u) => u.rol === 'cliente');
    const todasClases = this.clases.getAll();
    const todasReservaciones = this.reservaciones.getAll();
    const todosMembresias = this.membresias.getAll();
    const todosPagos = this.pagos.getAll();

    return {
      totalClientes: clientes.length,
      clientesActivos: clientes.filter((u) => u.activo).length,
      totalClases: todasClases.length,
      clasesActivas: todasClases.filter((c) => c.activa).length,
      totalReservaciones: todasReservaciones.length,
      reservacionesActivas: todasReservaciones.filter((r) => r.estado === 'confirmada').length,
      reservacionesCanceladas: todasReservaciones.filter((r) => r.estado === 'cancelada').length,
      membresiastActivas: todosMembresias.filter((m) => m.estado === 'activa').length,
      membresiastVencidas: todosMembresias.filter((m) => m.estado === 'vencida').length,
      totalRecaudado: todosPagos.filter((p) => p.estado === 'verificado').reduce((s, p) => s + p.monto, 0),
      pagosPendientes: todosPagos.filter((p) => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0),
      pagosRechazados: todosPagos.filter((p) => p.estado === 'rechazado').length,
    };
  });

  clasesMasDemandadas = computed(() => {
    const todas = this.clases.getAll();
    return todas
      .map((c) => ({
        clase: c,
        reservaciones: this.reservaciones.contarPorClase(c.id),
        ocupacion: Math.round(((c.cuposTotal - c.cuposDisponibles) / c.cuposTotal) * 100),
      }))
      .sort((a, b) => b.reservaciones - a.reservaciones)
      .slice(0, 6);
  });

  distribucionPlanes = computed(() => {
    const membresias = this.membresias.getAll().filter((m) => m.estado === 'activa');
    const map = new Map<string, { nombre: string; count: number }>();
    for (const m of membresias) {
      const key = m.planId;
      if (!map.has(key)) map.set(key, { nombre: m.plan.nombre, count: 0 });
      map.get(key)!.count++;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  });

  imprimir(): void {
    window.print();
  }
}
