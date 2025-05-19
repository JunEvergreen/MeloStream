import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap, tap, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private clientId = environment.spotify.clientId;
  private clientSecret = environment.spotify.clientSecret;
  private baseUrl = environment.spotify.apiUrl;
  private tokenUrl = environment.spotify.authUrl;
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  private getAccessToken(): Observable<string> {
    if (this.accessToken) {
      return from([this.accessToken]);
    }

    const auth = btoa(`${this.clientId}:${this.clientSecret}`);
    const headers = new HttpHeaders()
      .set('Authorization', `Basic ${auth}`)
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');

    return this.http.post(this.tokenUrl, body.toString(), { headers }).pipe(
      tap((response: any) => console.log('Token response:', response)),
      map((response: any) => {
        if (!response?.access_token) {
          throw new Error('No access token in response');
        }
        this.accessToken = response.access_token;
        return response.access_token;
      }),
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.error?.message || `Error Code: ${error.status}`;
    }
    console.error('API Error:', errorMessage);
    return throwError(() => errorMessage);
  }

  getNewReleases(): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}/browse/new-releases`, { headers });
      }),
      retry(1),
      catchError(this.handleError)
    );
  }

  getFeaturedPlaylists(): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}/browse/featured-playlists`, { headers });
      }),
      retry(1),
      catchError(this.handleError)
    );
  }
}
