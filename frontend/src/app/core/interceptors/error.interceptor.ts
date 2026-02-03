import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // TODO: Add error handling logic
  );
};
