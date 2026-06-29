import { Injectable } from '@angular/core';

export interface WaNotificacion {
  id: string;
  telefono: string;
  mensaje: string;
  tipo: 'reservacion' | 'pago' | 'recordatorio' | 'bienvenida';
  fecha: string;
  enviado: boolean;
  error?: string;
}

const STORAGE_KEY = 'cd_wa_notificaciones';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  getHistorial(): WaNotificacion[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  private registrar(n: Omit<WaNotificacion, 'id' | 'fecha' | 'enviado'>): void {
    const historial = this.getHistorial();
    const notif: WaNotificacion = {
      ...n,
      id: 'wa' + Date.now(),
      fecha: new Date().toISOString(),
      enviado: true,
    };
    historial.push(notif);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
    console.log(`[WhatsApp] → ${n.telefono}: ${n.mensaje}`);
  }

  notificarReservacion(telefono: string, nombre: string, clase: string, fecha: string, hora: string): void {
    this.registrar({
      telefono,
      tipo: 'reservacion',
      mensaje: `Hola ${nombre} 👋 Tu reservación para *${clase}* el *${fecha}* a las *${hora}* ha sido confirmada. ¡Te esperamos! 🏋️‍♀️`,
    });
  }

  notificarPagoRecibido(telefono: string, nombre: string, monto: number, concepto: string): void {
    this.registrar({
      telefono,
      tipo: 'pago',
      mensaje: `Hola ${nombre} ✅ Hemos recibido tu pago de *$${monto}* por *${concepto}*. En breve lo verificamos y recibirás tu recibo.`,
    });
  }

  notificarPagoVerificado(telefono: string, nombre: string, concepto: string, recibo: string): void {
    this.registrar({
      telefono,
      tipo: 'pago',
      mensaje: `Hola ${nombre} 🎉 Tu pago por *${concepto}* ha sido verificado. Tu recibo es *${recibo}*. ¡Disfruta tus clases!`,
    });
  }

  notificarBienvenida(telefono: string, nombre: string): void {
    this.registrar({
      telefono,
      tipo: 'bienvenida',
      mensaje: `¡Bienvenido/a ${nombre}! 🌟 Nos alegra que te unas a nuestra comunidad deportiva. Reserva tu primera clase desde la app. ¡Nos vemos pronto! 💪`,
    });
  }

  notificarRecordatorio(telefono: string, nombre: string, clase: string, hora: string): void {
    this.registrar({
      telefono,
      tipo: 'recordatorio',
      mensaje: `Hola ${nombre} ⏰ Recuerda que mañana tienes *${clase}* a las *${hora}*. ¡Prepara tu ropa deportiva!`,
    });
  }
}
