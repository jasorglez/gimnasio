export type TipoMembresia = 'mensual' | 'trimestral' | 'semestral' | 'anual';
export type EstadoMembresia = 'activa' | 'vencida' | 'pendiente' | 'cancelada';

export interface PlanMembresia {
  id: string;
  tipo: TipoMembresia;
  nombre: string;
  precio: number;
  duracionDias: number;
  clasesPorMes: number | 'ilimitadas';
  descripcion: string;
  beneficios: string[];
  popular?: boolean;
}

export interface Membresia {
  id: string;
  usuarioId: string;
  planId: string;
  plan: PlanMembresia;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: EstadoMembresia;
  clasesUsadas: number;
  pagoId?: string;
}
