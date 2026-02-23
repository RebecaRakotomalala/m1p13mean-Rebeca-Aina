import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn && authService.currentUser?.role === 'admin') {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const boutiqueGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn && authService.currentUser?.role === 'boutique') {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn && authService.currentUser?.role === 'client') {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
