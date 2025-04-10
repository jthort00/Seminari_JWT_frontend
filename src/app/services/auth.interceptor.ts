import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const token = localStorage.getItem('access_token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && localStorage.getItem('refresh_token')) {
        // Attempt to refresh the token
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = localStorage.getItem('access_token');
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            // If refresh fails, log out the user
            authService.logout();
            router.navigate(['/login']);
            toastr.error(
              'Your session has expired. Please log in again.',
              'Session Expired',
              { timeOut: 3000, closeButton: true }
            );
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
}
