import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (true) {
        case error.status === 401:
          // Only treat as session expiry if the user had a valid session.
          // Login-form 401s (wrong credentials, no existing token) pass through
          // to the component's own error handler.
          if (auth.isAuthenticated()) {
            auth.clearSession();
            router.navigateByUrl('/login');
            toast.show('Session expired. Please log in again.');
          }
          break;

        case error.status === 403:
          toast.show("You don't have permission to do that.", 'warning');
          break;

        case error.status === 413:
          toast.show('File is too large. Maximum allowed size is 25MB.', 'warning');
          break;

        case error.status === 0:
          // Network error — no HTTP response received
          toast.show('Network error. Please check your connection.');
          break;

        case error.status >= 500:
          toast.show('Something went wrong on the server. Please try again.');
          break;
      }

      return throwError(() => error);
    })
  );
};
