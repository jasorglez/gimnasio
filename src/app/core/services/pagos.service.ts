import { Injectable } from '@angular/core';
import { Pago, Recibo, MetodoPago } from '../models/pago.model';

const STORAGE_KEY = 'cd_pagos';
const RECIBOS_KEY = 'cd_recibos';

const SEED_PAGOS: Pago[] = [
  {
    id: 'pay1',
    usuarioId: 'u1',
    tipo: 'membresia',
    referencia: 'p2',
    concepto: 'Membresía Trimestral',
    monto: 2100,
    metodoPago: 'transferencia',
    estado: 'verificado',
    fechaPago: '2026-06-01',
    fechaVerificacion: '2026-06-02',
    verificadoPor: 'Admin Sistema',
    reciboGenerado: true,
  },
  {
    id: 'pay2',
    usuarioId: 'u2',
    tipo: 'membresia',
    referencia: 'p1',
    concepto: 'Membresía Mensual',
    monto: 800,
    metodoPago: 'mercadopago',
    estado: 'verificado',
    fechaPago: '2026-06-15',
    fechaVerificacion: '2026-06-15',
    verificadoPor: 'Admin Sistema',
    reciboGenerado: true,
  },
  {
    id: 'pay3',
    usuarioId: 'u3',
    tipo: 'membresia',
    referencia: 'p1',
    concepto: 'Membresía Mensual',
    monto: 800,
    metodoPago: 'efectivo',
    estado: 'pendiente',
    fechaPago: '2026-06-28',
    reciboGenerado: false,
  },
];

@Injectable({ providedIn: 'root' })
export class PagosService {
  constructor() {
    this.seed();
  }

  private seed(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PAGOS));
    }
    if (!localStorage.getItem(RECIBOS_KEY)) {
      localStorage.setItem(RECIBOS_KEY, JSON.stringify([]));
    }
  }

  getAll(): Pago[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  getByUsuario(usuarioId: string): Pago[] {
    return this.getAll().filter((p) => p.usuarioId === usuarioId);
  }

  getPendientes(): Pago[] {
    return this.getAll().filter((p) => p.estado === 'pendiente');
  }

  getById(id: string): Pago | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  registrar(data: {
    usuarioId: string;
    tipo: 'membresia' | 'clase';
    referencia: string;
    concepto: string;
    monto: number;
    metodoPago: MetodoPago;
    comprobante?: string;
    nombreArchivo?: string;
  }): Pago {
    const pagos = this.getAll();
    const nuevo: Pago = {
      id: 'pay' + Date.now(),
      ...data,
      estado: 'pendiente',
      fechaPago: new Date().toISOString().split('T')[0],
      reciboGenerado: false,
    };
    pagos.push(nuevo);
    this.save(pagos);
    return nuevo;
  }

  verificar(id: string, adminNombre: string): void {
    const pagos = this.getAll();
    const p = pagos.find((x) => x.id === id);
    if (p) {
      p.estado = 'verificado';
      p.fechaVerificacion = new Date().toISOString().split('T')[0];
      p.verificadoPor = adminNombre;
      this.save(pagos);
    }
  }

  rechazar(id: string, notas: string): void {
    const pagos = this.getAll();
    const p = pagos.find((x) => x.id === id);
    if (p) {
      p.estado = 'rechazado';
      p.notas = notas;
      this.save(pagos);
    }
  }

  generarRecibo(pagoId: string, usuario: { nombre: string; apellido: string; email: string }): Recibo {
    const pago = this.getById(pagoId);
    if (!pago) throw new Error('Pago no encontrado');

    const recibos: Recibo[] = JSON.parse(localStorage.getItem(RECIBOS_KEY) || '[]');
    const numero = 'REC-' + String(recibos.length + 1).padStart(5, '0');

    const recibo: Recibo = {
      id: 'rec' + Date.now(),
      numero,
      pagoId,
      fecha: new Date().toISOString().split('T')[0],
      usuarioNombre: `${usuario.nombre} ${usuario.apellido}`,
      usuarioEmail: usuario.email,
      concepto: pago.concepto,
      monto: pago.monto,
      metodoPago: pago.metodoPago,
    };

    recibos.push(recibo);
    localStorage.setItem(RECIBOS_KEY, JSON.stringify(recibos));

    const pagos = this.getAll();
    const p = pagos.find((x) => x.id === pagoId);
    if (p) {
      p.reciboGenerado = true;
      this.save(pagos);
    }

    return recibo;
  }

  getRecibosByUsuario(email: string): Recibo[] {
    const recibos: Recibo[] = JSON.parse(localStorage.getItem(RECIBOS_KEY) || '[]');
    return recibos.filter((r) => r.usuarioEmail === email);
  }

  getReciboByPago(pagoId: string): Recibo | undefined {
    const recibos: Recibo[] = JSON.parse(localStorage.getItem(RECIBOS_KEY) || '[]');
    return recibos.find((r) => r.pagoId === pagoId);
  }

  totalRecaudado(): number {
    return this.getAll()
      .filter((p) => p.estado === 'verificado')
      .reduce((sum, p) => sum + p.monto, 0);
  }

  private save(pagos: Pago[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pagos));
  }
}
