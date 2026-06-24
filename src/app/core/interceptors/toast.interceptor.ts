import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const toastInterceptor: HttpInterceptorFn = (req, next) => {
  const ns = inject(NotificationService);

  return next(req).pipe(
    tap((res: any) => {
      // Show success for mutating requests
      if (req.method === 'POST') ns.show('Saved successfully', 'success');
      if (req.method === 'PUT') ns.show('Updated successfully', 'success');
      if (req.method === 'DELETE') ns.show('Deleted successfully', 'success');
    }),
    catchError((err) => {
      const msg = err?.error?.message || err?.message || 'Request failed';
      ns.show(msg, 'error');
      return throwError(() => err);
    }),
  );
};
