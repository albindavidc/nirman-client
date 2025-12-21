import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  // Clone request with credentials for cookie handling
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 error and not already refreshing and not on auth routes
      if (
        error.status === 401 &&
        !isRefreshing &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/logout')
      ) {
        isRefreshing = true;

        // Try to refresh the token
        return http
          .post<{ message: string }>(
            `${environment.apiUrl}/auth/refresh`,
            {},
            { withCredentials: true }
          )
          .pipe(
            switchMap(() => {
              isRefreshing = false;
              // Retry the original request with new token
              return next(authReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              // Refresh failed, redirect to login
              localStorage.removeItem('user');
              router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
      }

      return throwError(() => error);
    })
  );
};
