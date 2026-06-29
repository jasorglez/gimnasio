import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PagosService } from '../../../core/services/pagos.service';
import { Pago, Recibo } from '../../../core/models/pago.model';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './mis-pagos.component.html',
  styleUrl: './mis-pagos.component.scss',
})
export class MisPagosComponent {
  private auth = inject(AuthService);
  private pagosService = inject(PagosService);

  usuario = this.auth.usuario;
  reciboVisible = signal<Recibo | null>(null);

  pagos = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.pagosService
      .getByUsuario(u.id)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  });

  verRecibo(pago: Pago): void {
    const recibo = this.pagosService.getReciboByPago(pago.id);
    if (recibo) {
      this.reciboVisible.set(recibo);
    } else if (pago.estado === 'verificado') {
      const u = this.usuario()!;
      const r = this.pagosService.generarRecibo(pago.id, {
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
      });
      this.reciboVisible.set(r);
    }
  }

  cerrarRecibo(): void {
    this.reciboVisible.set(null);
  }

  imprimirRecibo(): void {
    window.print();
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      verificado: 'badge-success',
      pendiente: 'badge-warning',
      rechazado: 'badge-danger',
    };
    return map[estado] ?? 'badge-primary';
  }

  getMetodoLabel(metodo: string): string {
    const map: Record<string, string> = {
      transferencia: '🏦 Transferencia',
      efectivo: '💵 Efectivo',
      tarjeta: '💳 Tarjeta',
      mercadopago: '📱 MercadoPago',
    };
    return map[metodo] ?? metodo;
  }
}
