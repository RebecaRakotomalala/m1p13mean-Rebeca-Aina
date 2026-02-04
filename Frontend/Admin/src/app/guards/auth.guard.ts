import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié et a le rôle admin
  if (authService.isAuthenticated() && authService.hasRole('admin')) {
    return true;
  }

  // Rediriger vers la page de login si non authentifié ou mauvais rôle
  router.navigate(['/login']);
  return false;
};

