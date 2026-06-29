import { Injectable } from '@angular/core';
import { Reservacion, EstadoReservacion } from '../models/reservacion.model';
import { ClasesService } from './clases.service';

const STORAGE_KEY = 'cd_reservaciones';

const SEED_RESERVACIONES: Reservacion[] = [
  {
    id: 'r1',
    usuarioId: 'u1',
    claseId: 'c1',
    fecha: '2026-06-30',
    estado: 'confirmada',
    fechaCreacion: '2026-06-25T10:00:00',
  },
  {
    id: 'r2',
    usuarioId: 'u1',
    claseId: 'c3',
    fecha: '2026-06-30',
    estado: 'confirmada',
    fechaCreacion: '2026-06-25T10:05:00',
  },
  {
    id: 'r3',
    usuarioId: 'u2',
    claseId: 'c5',
    fecha: '2026-06-30',
    estado: 'pendiente',
    fechaCreacion: '2026-06-26T09:00:00',
  },
  {
    id: 'r4',
    usuarioId: 'u3',
    claseId: 'c2',
    fecha: '2026-07-01',
    estado: 'confirmada',
    fechaCreacion: '2026-06-26T11:00:00',
  },
];

@Injectable({ providedIn: 'root' })
export class ReservacionesService {
  constructor(private clases: ClasesService) {
    this.seed();
  }

  private seed(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RESERVACIONES));
    }
  }

  getAll(): Reservacion[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  getByUsuario(usuarioId: string): Reservacion[] {
    return this.getAll().filter((r) => r.usuarioId === usuarioId);
  }

  getByClase(claseId: string): Reservacion[] {
    return this.getAll().filter((r) => r.claseId === claseId && r.estado !== 'cancelada');
  }

  crear(usuarioId: string, claseId: string, fecha: string): { ok: boolean; mensaje: string } {
    const clase = this.clases.getById(claseId);
    if (!clase) return { ok: false, mensaje: 'Clase no encontrada' };
    if (clase.cuposDisponibles <= 0) return { ok: false, mensaje: 'No hay cupos disponibles' };

    const existente = this.getAll().find(
      (r) => r.usuarioId === usuarioId && r.claseId === claseId && r.fecha === fecha && r.estado !== 'cancelada'
    );
    if (existente) return { ok: false, mensaje: 'Ya tienes una reservación para esta clase en esa fecha' };

    const reducido = this.clases.reducirCupo(claseId);
    if (!reducido) return { ok: false, mensaje: 'No hay cupos disponibles' };

    const reservaciones = this.getAll();
    const nueva: Reservacion = {
      id: 'r' + Date.now(),
      usuarioId,
      claseId,
      fecha,
      estado: 'confirmada',
      fechaCreacion: new Date().toISOString(),
    };
    reservaciones.push(nueva);
    this.save(reservaciones);
    return { ok: true, mensaje: 'Reservación confirmada exitosamente' };
  }

  cancelar(id: string, usuarioId?: string): { ok: boolean; mensaje: string } {
    const reservaciones = this.getAll();
    const r = reservaciones.find((x) => x.id === id);
    if (!r) return { ok: false, mensaje: 'Reservación no encontrada' };
    if (usuarioId && r.usuarioId !== usuarioId) return { ok: false, mensaje: 'Sin permiso' };
    if (r.estado === 'cancelada') return { ok: false, mensaje: 'Ya está cancelada' };

    r.estado = 'cancelada';
    this.clases.aumentarCupo(r.claseId);
    this.save(reservaciones);
    return { ok: true, mensaje: 'Reservación cancelada' };
  }

  cambiarEstado(id: string, estado: EstadoReservacion): void {
    const reservaciones = this.getAll();
    const r = reservaciones.find((x) => x.id === id);
    if (r) {
      r.estado = estado;
      this.save(reservaciones);
    }
  }

  contarPorClase(claseId: string): number {
    return this.getAll().filter((r) => r.claseId === claseId && r.estado !== 'cancelada').length;
  }

  private save(reservaciones: Reservacion[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservaciones));
  }
}
