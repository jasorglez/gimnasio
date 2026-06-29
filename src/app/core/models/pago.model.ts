export type EstadoPago = 'pendiente' | 'verificado' | 'rechazado';
export type TipoPago = 'membresia' | 'clase';
export type MetodoPago = 'transferencia' | 'efectivo' | 'tarjeta' | 'mercadopago';

export interface Pago {
  id: string;
  usuarioId: string;
  tipo: TipoPago;
  referencia: string;
  concepto: string;
  monto: number;
  metodoPago: MetodoPago;
  comprobante?: string;
  nombreArchivo?: string;
  estado: EstadoPago;
  fechaPago: string;
  fechaVerificacion?: string;
  verificadoPor?: string;
  notas?: string;
  reciboGenerado: boolean;
}

export interface Recibo {
  id: string;
  numero: string;
  pagoId: string;
  fecha: string;
  usuarioNombre: string;
  usuarioEmail: string;
  concepto: string;
  monto: number;
  metodoPago: MetodoPago;
}
