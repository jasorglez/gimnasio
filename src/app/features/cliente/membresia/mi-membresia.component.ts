import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MembresiasService, PLANES } from '../../../core/services/membresias.service';
import { PagosService } from '../../../core/services/pagos.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { PlanMembresia } from '../../../core/models/membresia.model';
import { MetodoPago } from '../../../core/models/pago.model';

@Component({
  selector: 'app-mi-membresia',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mi-membresia.component.html',
  styleUrl: './mi-membresia.component.scss',
})
export class MiMembresiaComponent {
  private auth = inject(AuthService);
  private membresiasService = inject(MembresiasService);
  private pagosService = inject(PagosService);
  private wa = inject(WhatsappService);

  usuario = this.auth.usuario;

  planes = PLANES;
  planSeleccionado = signal<PlanMembresia | null>(null);
  metodoPago = signal<MetodoPago>('transferencia');
  comprobante = signal<string | undefined>(undefined);
  nombreArchivo = signal('');
  procesando = signal(false);
  mensajeExito = signal('');

  membresia = computed(() => {
    const u = this.usuario();
    if (!u) return null;
    return this.membresiasService.getByUsuario(u.id) ?? null;
  });

  historial = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.membresiasService.getHistorialUsuario(u.id);
  });

  diasRestantes = computed(() => {
    const m = this.membresia();
    if (!m) return 0;
    const diff = new Date(m.fechaVencimiento).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  metodos: { value: MetodoPago; label: string }[] = [
    { value: 'transferencia', label: '🏦 Transferencia bancaria' },
    { value: 'efectivo', label: '💵 Efectivo en sucursal' },
    { value: 'tarjeta', label: '💳 Tarjeta de crédito/débito' },
    { value: 'mercadopago', label: '📱 MercadoPago' },
  ];

  seleccionarPlan(plan: PlanMembresia): void {
    this.planSeleccionado.set(plan);
    this.mensajeExito.set('');
  }

  onArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.nombreArchivo.set(file.name);
    const reader = new FileReader();
    reader.onload = (e) => this.comprobante.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  contratar(): void {
    const plan = this.planSeleccionado();
    const usuario = this.usuario();
    if (!plan || !usuario) return;

    this.procesando.set(true);
    setTimeout(() => {
      const pago = this.pagosService.registrar({
        usuarioId: usuario.id,
        tipo: 'membresia',
        referencia: plan.id,
        concepto: plan.nombre,
        monto: plan.precio,
        metodoPago: this.metodoPago(),
        comprobante: this.comprobante(),
        nombreArchivo: this.nombreArchivo() || undefined,
      });

      this.membresiasService.crear(usuario.id, plan.id, pago.id);
      this.wa.notificarPagoRecibido(usuario.telefono, usuario.nombre, plan.precio, plan.nombre);

      this.procesando.set(false);
      this.planSeleccionado.set(null);
      this.mensajeExito.set(`¡Membresía ${plan.nombre} activada! Tu pago está en revisión.`);
    }, 1000);
  }

  cancelarSeleccion(): void {
    this.planSeleccionado.set(null);
    this.comprobante.set(undefined);
    this.nombreArchivo.set('');
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getEstadoBadge(estado: string): string {
    const map: Record<string, string> = {
      activa: 'badge-success', vencida: 'badge-danger',
      pendiente: 'badge-warning', cancelada: 'badge-secondary',
    };
    return map[estado] ?? 'badge-primary';
  }

  precioMensual(plan: PlanMembresia): number {
    return Math.round(plan.precio / (plan.duracionDias / 30));
  }
}
