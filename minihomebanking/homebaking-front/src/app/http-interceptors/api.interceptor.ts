import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Simple interceptor used to log API errors centrally. */
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Pass through; proxy is configured in dev. Intercept errors for centralized logging.
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // In production you might forward to a monitoring service here.
        console.error('API Error', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message,
          error: err.error
        });
        return throwError(() => err);
      })
    );
  }
}
