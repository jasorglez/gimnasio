import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PagosService } from '../../../core/services/pagos.service';
import { MembresiasService } from '../../../core/services/membresias.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Pago } from '../../../core/models/pago.model';

@Component({
  selector: 'app-gestion-pagos',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './gestion-pagos.component.html',
  styleUrl: './gestion-pagos.component.scss',
})
export class GestionPagosComponent {
  private auth = inject(AuthService);
  private pagosService = inject(PagosService);
  private membresias = inject(MembresiasService);
  private wa = inject(WhatsappService);

  filtroEstado = signal('');
  mensaje = signal('');
  pagoDetalle = signal<Pago | null>(null);
  notasRechazo = signal('');

  pagos = computed(() => {
    let lista = this.pagosService.getAll().sort(
      (a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
    );
    if (this.filtroEstado()) lista = lista.filter((p) => p.estado === this.filtroEstado());
    return lista;
  });

  getUsuario(id: string) {
    return this.auth.getById(id);
  }

  verificar(pago: Pago): void {
    const adminUser = this.auth.usuario();
    if (!adminUser) return;
    this.pagosService.verificar(pago.id, `${adminUser.nombre} ${adminUser.apellido}`);

    if (pago.tipo === 'membresia') {
      const membresia = this.membresias.crear(pago.usuarioId, pago.referencia, pago.id);
      const usuario = this.getUsuario(pago.usuarioId);
      if (usuario) {
        const recibo = this.pagosService.generarRecibo(pago.id, {
          nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email,
        });
        this.wa.notificarPagoVerificado(usuario.telefono, usuario.nombre, pago.concepto, recibo.numero);
      }
    }

    this.mensaje.set('Pago verificado y membresía activada');
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  rechazar(pago: Pago): void {
    if (!this.notasRechazo()) {
      this.mensaje.set('Escribe el motivo del rechazo');
      return;
    }
    this.pagosService.rechazar(pago.id, this.notasRechazo());
    this.pagoDetalle.set(null);
    this.notasRechazo.set('');
    this.mensaje.set('Pago rechazado');
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  verDetalle(pago: Pago): void {
    this.pagoDetalle.set(pago);
    this.notasRechazo.set('');
  }

  cerrarDetalle(): void {
    this.pagoDetalle.set(null);
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      verificado: 'badge-success', pendiente: 'badge-warning', rechazado: 'badge-danger',
    };
    return map[estado] ?? '';
  }

  getMetodoLabel(m: string): string {
    const map: Record<string, string> = {
      transferencia: '🏦 Transferencia', efectivo: '💵 Efectivo',
      tarjeta: '💳 Tarjeta', mercadopago: '📱 MercadoPago',
    };
    return map[m] ?? m;
  }
}
