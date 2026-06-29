import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClasesService } from '../../../core/services/clases.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Clase, DiaSemana } from '../../../core/models/clase.model';

@Component({
  selector: 'app-lista-clases',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './lista-clases.component.html',
  styleUrl: './lista-clases.component.scss',
})
export class ListaClasesComponent {
  private auth = inject(AuthService);
  private clasesService = inject(ClasesService);
  private reservaciones = inject(ReservacionesService);
  private wa = inject(WhatsappService);

  usuario = this.auth.usuario;
  filtroDia = signal<string>('');
  filtroDisciplina = signal<string>('');
  busqueda = signal('');

  modalClase = signal<Clase | null>(null);
  fechaSeleccionada = signal('');
  reservandoId = signal('');
  mensajeExito = signal('');
  mensajeError = signal('');

  clases = computed(() => {
    let lista = this.clasesService.getActivas();
    if (this.filtroDia()) lista = lista.filter((c) => c.diasSemana.includes(this.filtroDia() as DiaSemana));
    if (this.filtroDisciplina()) lista = lista.filter((c) => c.disciplina === this.filtroDisciplina());
    if (this.busqueda()) {
      const b = this.busqueda().toLowerCase();
      lista = lista.filter((c) => c.nombre.toLowerCase().includes(b) || c.instructor.toLowerCase().includes(b));
    }
    return lista;
  });

  dias: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  disciplinas = [
    { value: 'yoga', label: 'Yoga' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'natacion', label: 'Natación' },
    { value: 'spinning', label: 'Spinning' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'boxeo', label: 'Boxeo' },
    { value: 'zumba', label: 'Zumba' },
    { value: 'gimnasio', label: 'Gimnasio' },
  ];

  abrirModal(clase: Clase): void {
    this.modalClase.set(clase);
    this.fechaSeleccionada.set(this.proximaFecha(clase.diasSemana[0]));
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cerrarModal(): void {
    this.modalClase.set(null);
  }

  reservar(): void {
    const clase = this.modalClase();
    const usuario = this.usuario();
    if (!clase || !usuario || !this.fechaSeleccionada()) return;

    this.reservandoId.set(clase.id);
    const res = this.reservaciones.crear(usuario.id, clase.id, this.fechaSeleccionada());
    this.reservandoId.set('');

    if (res.ok) {
      this.mensajeExito.set(res.mensaje);
      this.mensajeError.set('');
      this.wa.notificarReservacion(
        usuario.telefono,
        usuario.nombre,
        clase.nombre,
        this.fechaSeleccionada(),
        clase.horaInicio
      );
      setTimeout(() => this.cerrarModal(), 2000);
    } else {
      this.mensajeError.set(res.mensaje);
    }
  }

  proximaFecha(dia: DiaSemana): string {
    const diasMap: Record<DiaSemana, number> = {
      domingo: 0, lunes: 1, martes: 2, miercoles: 3,
      jueves: 4, viernes: 5, sabado: 6,
    };
    const hoy = new Date();
    const objetivo = diasMap[dia];
    const diff = (objetivo - hoy.getDay() + 7) % 7 || 7;
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + diff);
    return fecha.toISOString().split('T')[0];
  }

  formatDias(dias: DiaSemana[]): string {
    const map: Record<string, string> = {
      lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
      jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
    };
    return dias.map((d) => map[d]).join(', ');
  }

  getCuposClass(clase: Clase): string {
    if (clase.cuposDisponibles === 0) return 'full';
    if (clase.cuposDisponibles <= 3) return 'low';
    return 'ok';
  }
}
