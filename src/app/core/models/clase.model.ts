export type DisciplinaClase = 'yoga' | 'crossfit' | 'natacion' | 'spinning' | 'pilates' | 'boxeo' | 'zumba' | 'gimnasio';
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface Clase {
  id: string;
  nombre: string;
  descripcion: string;
  disciplina: DisciplinaClase;
  instructor: string;
  diasSemana: DiaSemana[];
  horaInicio: string;
  horaFin: string;
  cuposTotal: number;
  cuposDisponibles: number;
  precio: number;
  activa: boolean;
  color: string;
  emoji: string;
}
