import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';
import { catchError, Observable } from 'rxjs';
import { ChesscomProfile } from '../components/chesscom-profile.component';
@Injectable({
  providedIn: 'root',
})
export class ChesscomSearchService extends BaseApiService {
  searchChesscom(username: string): Observable<ChesscomProfile> {
    const url = this.buildUrl(
      API_ENDPOINTS.CHESSCOM_SEARCH + '{username}/profile',
      {
        username,
      }
    );

    return this.http
      .get<ChesscomProfile>(url, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }
}
