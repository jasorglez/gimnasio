export type RolUsuario = 'admin' | 'cliente';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
  fechaRegistro: Date;
}

export interface UsuarioPublico {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
  activo: boolean;
  fechaRegistro: Date;
}
