import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { catchError, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';
import { LichessProfile } from '../components/lichess-profile.component';

@Injectable({
  providedIn: 'root',
})
export class LichessSearchService extends BaseApiService {
  searchLichess(username: string): Observable<LichessProfile> {
    const url = this.buildUrl(
      API_ENDPOINTS.LICHESS_SEARCH + '{username}/profile',
      {
        username,
      }
    );

    return this.http
      .get<LichessProfile>(url, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }
}
