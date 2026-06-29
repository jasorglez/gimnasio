export type EstadoReservacion = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Reservacion {
  id: string;
  usuarioId: string;
  claseId: string;
  fecha: string; // ISO string YYYY-MM-DD
  estado: EstadoReservacion;
  fechaCreacion: string;
  notas?: string;
}
