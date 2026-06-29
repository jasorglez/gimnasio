import { Injectable } from '@angular/core';
import { Membresia, PlanMembresia } from '../models/membresia.model';

const STORAGE_KEY = 'cd_membresias';

export const PLANES: PlanMembresia[] = [
  {
    id: 'p1',
    tipo: 'mensual',
    nombre: 'Plan Mensual',
    precio: 800,
    duracionDias: 30,
    clasesPorMes: 8,
    descripcion: 'Perfecto para empezar',
    beneficios: ['8 clases por mes', 'Acceso a todas las disciplinas', 'App de reservaciones'],
  },
  {
    id: 'p2',
    tipo: 'trimestral',
    nombre: 'Plan Trimestral',
    precio: 2100,
    duracionDias: 90,
    clasesPorMes: 'ilimitadas',
    descripcion: 'El más popular',
    beneficios: [
      'Clases ilimitadas',
      'Ahorra 15% vs mensual',
      'Acceso a todas las disciplinas',
      'App de reservaciones',
      '1 evaluación física',
    ],
    popular: true,
  },
  {
    id: 'p3',
    tipo: 'semestral',
    nombre: 'Plan Semestral',
    precio: 3600,
    duracionDias: 180,
    clasesPorMes: 'ilimitadas',
    descripcion: 'Compromiso a mediano plazo',
    beneficios: [
      'Clases ilimitadas',
      'Ahorra 25% vs mensual',
      'Acceso a todas las disciplinas',
      'App de reservaciones',
      '2 evaluaciones físicas',
      'Plan nutricional básico',
    ],
  },
  {
    id: 'p4',
    tipo: 'anual',
    nombre: 'Plan Anual',
    precio: 6000,
    duracionDias: 365,
    clasesPorMes: 'ilimitadas',
    descripcion: 'Máximo ahorro',
    beneficios: [
      'Clases ilimitadas',
      'Ahorra 37% vs mensual',
      'Acceso a todas las disciplinas',
      'App de reservaciones',
      'Evaluaciones físicas mensuales',
      'Plan nutricional completo',
      'Acceso 24/7',
      'Casillero incluido',
    ],
  },
];

const SEED_MEMBRESIAS: Membresia[] = [
  {
    id: 'm1',
    usuarioId: 'u1',
    planId: 'p2',
    plan: PLANES[1],
    fechaInicio: '2026-06-01',
    fechaVencimiento: '2026-08-31',
    estado: 'activa',
    clasesUsadas: 12,
    pagoId: 'pay1',
  },
  {
    id: 'm2',
    usuarioId: 'u2',
    planId: 'p1',
    plan: PLANES[0],
    fechaInicio: '2026-06-15',
    fechaVencimiento: '2026-07-15',
    estado: 'activa',
    clasesUsadas: 3,
    pagoId: 'pay2',
  },
];

@Injectable({ providedIn: 'root' })
export class MembresiasService {
  constructor() {
    this.seed();
  }

  private seed(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MEMBRESIAS));
    }
  }

  getPlanes(): PlanMembresia[] {
    return PLANES;
  }

  getPlanById(id: string): PlanMembresia | undefined {
    return PLANES.find((p) => p.id === id);
  }

  getAll(): Membresia[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  getByUsuario(usuarioId: string): Membresia | undefined {
    const todas = this.getAll();
    return todas.find((m) => m.usuarioId === usuarioId && m.estado === 'activa');
  }

  getHistorialUsuario(usuarioId: string): Membresia[] {
    return this.getAll().filter((m) => m.usuarioId === usuarioId);
  }

  crear(usuarioId: string, planId: string, pagoId: string): Membresia {
    const plan = this.getPlanById(planId);
    if (!plan) throw new Error('Plan no encontrado');

    const inicio = new Date();
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + plan.duracionDias);

    const nueva: Membresia = {
      id: 'm' + Date.now(),
      usuarioId,
      planId,
      plan,
      fechaInicio: inicio.toISOString().split('T')[0],
      fechaVencimiento: vencimiento.toISOString().split('T')[0],
      estado: 'activa',
      clasesUsadas: 0,
      pagoId,
    };

    const membresias = this.getAll();
    const anterior = membresias.find((m) => m.usuarioId === usuarioId && m.estado === 'activa');
    if (anterior) anterior.estado = 'vencida';

    membresias.push(nueva);
    this.save(membresias);
    return nueva;
  }

  cancelar(id: string): void {
    const membresias = this.getAll();
    const m = membresias.find((x) => x.id === id);
    if (m) {
      m.estado = 'cancelada';
      this.save(membresias);
    }
  }

  registrarUso(usuarioId: string): void {
    const membresias = this.getAll();
    const m = membresias.find((x) => x.usuarioId === usuarioId && x.estado === 'activa');
    if (m) {
      m.clasesUsadas++;
      this.save(membresias);
    }
  }

  estaVencida(m: Membresia): boolean {
    return new Date(m.fechaVencimiento) < new Date();
  }

  private save(membresias: Membresia[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(membresias));
  }
}
