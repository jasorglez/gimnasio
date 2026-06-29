import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);
  mostrarPassword = signal(false);

  login(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    setTimeout(() => {
      const res = this.auth.login(this.email(), this.password());
      this.loading.set(false);
      if (!res.ok) {
        this.error.set(res.mensaje);
        return;
      }
      if (this.auth.isAdmin()) this.router.navigate(['/admin']);
      else this.router.navigate(['/cliente']);
    }, 600);
  }

  usarDemo(tipo: 'admin' | 'cliente'): void {
    if (tipo === 'admin') {
      this.email.set('admin@demo.com');
      this.password.set('admin123');
    } else {
      this.email.set('juan@demo.com');
      this.password.set('cliente123');
    }
  }
}
