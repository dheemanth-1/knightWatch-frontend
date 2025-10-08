import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { finalize } from 'rxjs/operators';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  console.log(`HTTP Request: ${req.method} ${req.url}`);

  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      //TODO: Add authorization header
      // 'Authorization': `Bearer ${token}`
    },
  });

  return next(modifiedReq).pipe(
    finalize(() => {
      console.log(`HTTP Response for: ${req.method} ${req.url}`);
    })
  );
};
