import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { API_ENDPOINTS } from '../shared/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  protected baseUrl = API_ENDPOINTS.BASE_URL;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  protected buildUrl(
    endpoint: string,
    pathParams?: Record<string, string>
  ): string {
    let url = `${this.baseUrl}${endpoint}`;

    if (pathParams) {
      Object.keys(pathParams).forEach((key) => {
        url = url.replace(`{${key}}`, pathParams[key]);
      });
    }

    return url;
  }

  protected createHttpParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return httpParams;
  }
}
