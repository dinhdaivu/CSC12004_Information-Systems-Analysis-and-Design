import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { AppRole } from '@shared/models/auth.model';
import { AuthService } from '@core/services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as AppRole[] | undefined) ?? [];

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (allowedRoles.length === 0 || authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree([authService.getDefaultRouteForRole(authService.getCurrentUser()?.role ?? null)]);
};
