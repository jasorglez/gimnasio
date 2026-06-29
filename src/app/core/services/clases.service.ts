import { Injectable, signal } from '@angular/core';
import { Clase, DisciplinaClase } from '../models/clase.model';

const STORAGE_KEY = 'cd_clases';

const SEED_CLASES: Clase[] = [
  {
    id: 'c1',
    nombre: 'Yoga Matutino',
    descripcion: 'Clase de yoga para comenzar el día con energía, enfocada en flexibilidad y respiración.',
    disciplina: 'yoga',
    instructor: 'Laura Méndez',
    diasSemana: ['lunes', 'miercoles', 'viernes'],
    horaInicio: '07:00',
    horaFin: '08:00',
    cuposTotal: 10,
    cuposDisponibles: 4,
    precio: 150,
    activa: true,
    color: '#7c3aed',
    emoji: '🧘',
  },
  {
    id: 'c2',
    nombre: 'CrossFit Intensivo',
    descripcion: 'Entrenamiento de alta intensidad con ejercicios funcionales. Quema grasa y gana músculo.',
    disciplina: 'crossfit',
    instructor: 'Roberto Soto',
    diasSemana: ['martes', 'jueves'],
    horaInicio: '06:00',
    horaFin: '07:00',
    cuposTotal: 10,
    cuposDisponibles: 2,
    precio: 200,
    activa: true,
    color: '#dc2626',
    emoji: '🏋️',
  },
  {
    id: 'c3',
    nombre: 'Spinning Power',
    descripcion: 'Ciclismo indoor con música motivadora. Mejora resistencia cardiovascular y quema calorías.',
    disciplina: 'spinning',
    instructor: 'Ana Ramírez',
    diasSemana: ['lunes', 'miercoles', 'viernes'],
    horaInicio: '18:00',
    horaFin: '19:00',
    cuposTotal: 10,
    cuposDisponibles: 7,
    precio: 180,
    activa: true,
    color: '#ea580c',
    emoji: '🚴',
  },
  {
    id: 'c4',
    nombre: 'Pilates Esencial',
    descripcion: 'Fortalece el core y mejora la postura con ejercicios de control y precisión.',
    disciplina: 'pilates',
    instructor: 'Sandra Vega',
    diasSemana: ['martes', 'viernes'],
    horaInicio: '09:00',
    horaFin: '10:00',
    cuposTotal: 10,
    cuposDisponibles: 6,
    precio: 160,
    activa: true,
    color: '#0891b2',
    emoji: '🤸',
  },
  {
    id: 'c5',
    nombre: 'Zumba Fit',
    descripcion: 'Baile y ejercicio combinados en una clase divertida y energética. Para todos los niveles.',
    disciplina: 'zumba',
    instructor: 'Carmen Torres',
    diasSemana: ['lunes', 'jueves'],
    horaInicio: '19:00',
    horaFin: '20:00',
    cuposTotal: 10,
    cuposDisponibles: 3,
    precio: 140,
    activa: true,
    color: '#db2777',
    emoji: '💃',
  },
  {
    id: 'c6',
    nombre: 'Boxeo Amateur',
    descripcion: 'Técnica de boxeo, coordinación y cardio. No se requiere experiencia previa.',
    disciplina: 'boxeo',
    instructor: 'Miguel Herrera',
    diasSemana: ['miercoles', 'viernes'],
    horaInicio: '17:00',
    horaFin: '18:00',
    cuposTotal: 10,
    cuposDisponibles: 5,
    precio: 190,
    activa: true,
    color: '#b45309',
    emoji: '🥊',
  },
  {
    id: 'c7',
    nombre: 'Natación Básica',
    descripcion: 'Aprende o mejora tu técnica de natación con instructor certificado.',
    disciplina: 'natacion',
    instructor: 'Jorge Campos',
    diasSemana: ['sabado'],
    horaInicio: '10:00',
    horaFin: '11:00',
    cuposTotal: 10,
    cuposDisponibles: 8,
    precio: 170,
    activa: true,
    color: '#0284c7',
    emoji: '🏊',
  },
  {
    id: 'c8',
    nombre: 'Gimnasio Libre',
    descripcion: 'Acceso libre a equipos de musculación y cardio con supervisión de entrenador.',
    disciplina: 'gimnasio',
    instructor: 'Staff Gym',
    diasSemana: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    horaInicio: '06:00',
    horaFin: '22:00',
    cuposTotal: 10,
    cuposDisponibles: 10,
    precio: 100,
    activa: true,
    color: '#047857',
    emoji: '💪',
  },
];

@Injectable({ providedIn: 'root' })
export class ClasesService {
  private readonly refresh = signal(0);

  constructor() {
    this.seed();
  }

  private seed(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CLASES));
    }
  }

  getAll(): Clase[] {
    this.refresh();
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  getActivas(): Clase[] {
    return this.getAll().filter((c) => c.activa);
  }

  getById(id: string): Clase | undefined {
    return this.getAll().find((c) => c.id === id);
  }

  crear(data: Omit<Clase, 'id'>): Clase {
    const clases = this.getAll();
    const nueva: Clase = { ...data, id: 'c' + Date.now() };
    clases.push(nueva);
    this.save(clases);
    return nueva;
  }

  actualizar(id: string, data: Partial<Clase>): void {
    const clases = this.getAll();
    const idx = clases.findIndex((c) => c.id === id);
    if (idx >= 0) {
      clases[idx] = { ...clases[idx], ...data };
      this.save(clases);
    }
  }

  toggleActiva(id: string): void {
    const clases = this.getAll();
    const c = clases.find((x) => x.id === id);
    if (c) {
      c.activa = !c.activa;
      this.save(clases);
    }
  }

  reducirCupo(id: string): boolean {
    const clases = this.getAll();
    const c = clases.find((x) => x.id === id);
    if (!c || c.cuposDisponibles <= 0) return false;
    c.cuposDisponibles--;
    this.save(clases);
    return true;
  }

  aumentarCupo(id: string): void {
    const clases = this.getAll();
    const c = clases.find((x) => x.id === id);
    if (c && c.cuposDisponibles < c.cuposTotal) {
      c.cuposDisponibles++;
      this.save(clases);
    }
  }

  eliminar(id: string): void {
    const clases = this.getAll().filter((c) => c.id !== id);
    this.save(clases);
  }

  private save(clases: Clase[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clases));
    this.refresh.update((v) => v + 1);
  }

  getDisciplinaLabel(d: DisciplinaClase): string {
    const map: Record<DisciplinaClase, string> = {
      yoga: 'Yoga',
      crossfit: 'CrossFit',
      natacion: 'Natación',
      spinning: 'Spinning',
      pilates: 'Pilates',
      boxeo: 'Boxeo',
      zumba: 'Zumba',
      gimnasio: 'Gimnasio',
    };
    return map[d] ?? d;
  }
}
