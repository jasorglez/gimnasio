import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  router.navigate(['/cliente']);
  return false;
};

export const clienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && !auth.isAdmin()) return true;
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }
  router.navigate(['/login']);
  return false;
};

export const publicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  if (auth.isAdmin()) router.navigate(['/admin']);
  else router.navigate(['/cliente']);
  return false;
};
