import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ClasesService } from '../../../core/services/clases.service';
import { ReservacionesService } from '../../../core/services/reservaciones.service';
import { Clase, DisciplinaClase, DiaSemana } from '../../../core/models/clase.model';

type FormClase = Omit<Clase, 'id'>;

const CLASE_VACIA: FormClase = {
  nombre: '', descripcion: '', disciplina: 'yoga', instructor: '',
  diasSemana: [], horaInicio: '', horaFin: '',
  cuposTotal: 10, cuposDisponibles: 10,
  precio: 0, activa: true, color: '#6c63ff', emoji: '🏋️',
};

@Component({
  selector: 'app-gestion-clases',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './gestion-clases.component.html',
  styleUrl: './gestion-clases.component.scss',
})
export class GestionClasesComponent {
  private clasesService = inject(ClasesService);
  private reservacionesService = inject(ReservacionesService);

  clases = computed(() => this.clasesService.getAll());
  modalAbierto = signal(false);
  editando = signal<Clase | null>(null);
  form = signal<FormClase>({ ...CLASE_VACIA });
  mensaje = signal('');

  disciplinas: { value: DisciplinaClase; label: string; emoji: string }[] = [
    { value: 'yoga', label: 'Yoga', emoji: '🧘' },
    { value: 'crossfit', label: 'CrossFit', emoji: '🏋️' },
    { value: 'natacion', label: 'Natación', emoji: '🏊' },
    { value: 'spinning', label: 'Spinning', emoji: '🚴' },
    { value: 'pilates', label: 'Pilates', emoji: '🤸' },
    { value: 'boxeo', label: 'Boxeo', emoji: '🥊' },
    { value: 'zumba', label: 'Zumba', emoji: '💃' },
    { value: 'gimnasio', label: 'Gimnasio', emoji: '💪' },
  ];

  dias: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  colores = ['#6c63ff', '#dc2626', '#ea580c', '#0891b2', '#db2777', '#b45309', '#0284c7', '#047857'];

  abrirNueva(): void {
    this.editando.set(null);
    this.form.set({ ...CLASE_VACIA });
    this.modalAbierto.set(true);
  }

  abrirEditar(clase: Clase): void {
    this.editando.set(clase);
    const { id: _, ...resto } = clase;
    this.form.set({ ...resto });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  toggleDia(dia: DiaSemana): void {
    const current = this.form().diasSemana;
    const updated = current.includes(dia)
      ? current.filter((d) => d !== dia)
      : [...current, dia];
    this.form.update((f) => ({ ...f, diasSemana: updated }));
  }

  onDisciplinaChange(valor: string): void {
    const d = this.disciplinas.find((x) => x.value === valor);
    if (d) {
      this.form.update((f) => ({ ...f, disciplina: d.value, emoji: d.emoji }));
    }
  }

  guardar(): void {
    const f = this.form();
    if (!f.nombre || !f.instructor || !f.horaInicio || !f.horaFin || f.diasSemana.length === 0) {
      this.mensaje.set('Completa todos los campos requeridos');
      return;
    }

    const editando = this.editando();
    if (editando) {
      this.clasesService.actualizar(editando.id, f);
      this.mensaje.set('Clase actualizada correctamente');
    } else {
      this.clasesService.crear(f);
      this.mensaje.set('Clase creada correctamente');
    }
    this.cerrarModal();
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  toggleActiva(clase: Clase): void {
    this.clasesService.toggleActiva(clase.id);
  }

  contarReservaciones(claseId: string): number {
    return this.reservacionesService.contarPorClase(claseId);
  }

  formatDias(dias: DiaSemana[]): string {
    const map: Record<string, string> = {
      lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
      jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
    };
    return dias.map((d) => map[d] ?? d).join(', ');
  }

  updateForm(field: keyof FormClase, value: unknown): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }
}
