import { Injectable, signal, computed } from '@angular/core';
import { Usuario, UsuarioPublico } from '../models/usuario.model';

const STORAGE_KEY = 'cd_usuarios';
const SESSION_KEY = 'cd_session';

const SEED_USUARIOS: Usuario[] = [
  {
    id: 'u0',
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@demo.com',
    telefono: '5551000000',
    password: 'admin123',
    rol: 'admin',
    activo: true,
    fechaRegistro: new Date('2024-01-01'),
  },
  {
    id: 'u1',
    nombre: 'Juan',
    apellido: 'García',
    email: 'juan@demo.com',
    telefono: '5551234567',
    password: 'cliente123',
    rol: 'cliente',
    activo: true,
    fechaRegistro: new Date('2024-03-15'),
  },
  {
    id: 'u2',
    nombre: 'María',
    apellido: 'López',
    email: 'maria@demo.com',
    telefono: '5557654321',
    password: 'cliente123',
    rol: 'cliente',
    activo: true,
    fechaRegistro: new Date('2024-04-10'),
  },
  {
    id: 'u3',
    nombre: 'Carlos',
    apellido: 'Martínez',
    email: 'carlos@demo.com',
    telefono: '5559876543',
    password: 'cliente123',
    rol: 'cliente',
    activo: true,
    fechaRegistro: new Date('2024-05-20'),
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioActual = signal<UsuarioPublico | null>(null);
  readonly usuario = this.usuarioActual.asReadonly();
  readonly isLoggedIn = computed(() => this.usuarioActual() !== null);
  readonly isAdmin = computed(() => this.usuarioActual()?.rol === 'admin');

  constructor() {
    this.seed();
    this.restaurarSesion();
  }

  private seed(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USUARIOS));
    }
  }

  private getUsuarios(): Usuario[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  private saveUsuarios(usuarios: Usuario[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  }

  private restaurarSesion(): void {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      this.usuarioActual.set(JSON.parse(session));
    }
  }

  login(email: string, password: string): { ok: boolean; mensaje: string } {
    const usuarios = this.getUsuarios();
    const user = usuarios.find((u) => u.email === email && u.password === password);
    if (!user) return { ok: false, mensaje: 'Email o contraseña incorrectos' };
    if (!user.activo) return { ok: false, mensaje: 'Usuario inactivo. Contacta al administrador.' };

    const { password: _, ...pub } = user;
    this.usuarioActual.set(pub as UsuarioPublico);
    localStorage.setItem(SESSION_KEY, JSON.stringify(pub));
    return { ok: true, mensaje: 'Bienvenido' };
  }

  logout(): void {
    this.usuarioActual.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  registro(data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password: string;
  }): { ok: boolean; mensaje: string } {
    const usuarios = this.getUsuarios();
    if (usuarios.find((u) => u.email === data.email)) {
      return { ok: false, mensaje: 'Este email ya está registrado' };
    }
    const nuevo: Usuario = {
      id: 'u' + Date.now(),
      ...data,
      rol: 'cliente',
      activo: true,
      fechaRegistro: new Date(),
    };
    usuarios.push(nuevo);
    this.saveUsuarios(usuarios);

    const { password: _, ...pub } = nuevo;
    this.usuarioActual.set(pub as UsuarioPublico);
    localStorage.setItem(SESSION_KEY, JSON.stringify(pub));
    return { ok: true, mensaje: 'Registro exitoso' };
  }

  getUsuariosPublicos(): UsuarioPublico[] {
    return this.getUsuarios().map(({ password: _, ...u }) => u as UsuarioPublico);
  }

  toggleActivo(id: string): void {
    const usuarios = this.getUsuarios();
    const u = usuarios.find((x) => x.id === id);
    if (u) {
      u.activo = !u.activo;
      this.saveUsuarios(usuarios);
    }
  }

  getById(id: string): UsuarioPublico | undefined {
    const u = this.getUsuarios().find((x) => x.id === id);
    if (!u) return undefined;
    const { password: _, ...pub } = u;
    return pub as UsuarioPublico;
  }
}
