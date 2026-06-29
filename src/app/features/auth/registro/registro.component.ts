import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private wa = inject(WhatsappService);

  nombre = signal('');
  apellido = signal('');
  email = signal('');
  telefono = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal('');
  loading = signal(false);
  mostrarPassword = signal(false);

  registrar(): void {
    if (!this.nombre() || !this.apellido() || !this.email() || !this.telefono() || !this.password()) {
      this.error.set('Completa todos los campos');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    setTimeout(() => {
      const res = this.auth.registro({
        nombre: this.nombre(),
        apellido: this.apellido(),
        email: this.email(),
        telefono: this.telefono(),
        password: this.password(),
      });
      this.loading.set(false);
      if (!res.ok) {
        this.error.set(res.mensaje);
        return;
      }
      this.wa.notificarBienvenida(this.telefono(), this.nombre());
      this.router.navigate(['/cliente']);
    }, 800);
  }
}
