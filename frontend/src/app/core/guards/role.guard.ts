import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { AppRole } from '@shared/models/auth.model';
import { AuthService } from '@core/services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as AppRole[] | undefined) ?? [];
  const getFallbackRoute = () => router.createUrlTree([
    authService.getDefaultRouteForRole(authService.getCurrentUser()?.role ?? null),
  ]);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.length === 0) {
    return true;
  }

  if (authService.getCurrentUser()) {
    return authService.hasAnyRole(allowedRoles) ? true : getFallbackRoute();
  }

  return authService.loadCurrentUser().pipe(
    map((user) => (allowedRoles.includes(user.role) ? true : getFallbackRoute())),
    catchError(() => {
      authService.clearSession();
      return of(router.createUrlTree(['/login']));
    })
  );
};
