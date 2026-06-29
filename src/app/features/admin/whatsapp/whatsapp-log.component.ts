import { Component, inject, computed } from '@angular/core';
import { WhatsappService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-log',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp-log.component.html',
  styleUrl: './whatsapp-log.component.scss',
})
export class WhatsappLogComponent {
  private wa = inject(WhatsappService);

  notificaciones = computed(() =>
    this.wa.getHistorial().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  );

  getTipoIcon(tipo: string): string {
    const map: Record<string, string> = {
      reservacion: '📅', pago: '💳', recordatorio: '⏰', bienvenida: '👋',
    };
    return map[tipo] ?? '💬';
  }

  getTipoBadge(tipo: string): string {
    const map: Record<string, string> = {
      reservacion: 'badge-primary', pago: 'badge-success',
      recordatorio: 'badge-warning', bienvenida: 'badge-info',
    };
    return map[tipo] ?? 'badge-primary';
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleString('es-MX', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }
}
