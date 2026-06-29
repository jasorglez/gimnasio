import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MembresiasService } from '../../../core/services/membresias.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss',
})
export class GestionUsuariosComponent {
  private auth = inject(AuthService);
  private membresias = inject(MembresiasService);
  private reservaciones = inject(ReservacionesService);

  busqueda = signal('');
  mensaje = signal('');

  usuarios = computed(() => {
    let lista = this.auth.getUsuariosPublicos().filter((u) => u.rol === 'cliente');
    if (this.busqueda()) {
      const b = this.busqueda().toLowerCase();
      lista = lista.filter(
        (u) =>
          u.nombre.toLowerCase().includes(b) ||
          u.apellido.toLowerCase().includes(b) ||
          u.email.toLowerCase().includes(b)
      );
    }
    return lista;
  });

  getMembresia(usuarioId: string) {
    return this.membresias.getByUsuario(usuarioId);
  }

  getReservaciones(usuarioId: string): number {
    return this.reservaciones.getByUsuario(usuarioId).filter((r) => r.estado !== 'cancelada').length;
  }

  toggleActivo(id: string): void {
    this.auth.toggleActivo(id);
    this.mensaje.set('Estado actualizado');
    setTimeout(() => this.mensaje.set(''), 2000);
  }

  formatFecha(f: string | Date): string {
    return new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  iniciales(nombre: string, apellido: string): string {
    return (nombre[0] + apellido[0]).toUpperCase();
  }
}
