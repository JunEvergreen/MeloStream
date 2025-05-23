import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  artist_id: string;
  audio: string;         // URL to the audio file
  image: string;         // Album/Track artwork
  album_name: string;
  position: number;      // Track position in album
  releasedate: string;
  license_ccurl: string; // Creative Commons license URL
}

export interface JamendoResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message: string | null;
    results_count: number;
    warnings: string[];
  };
  results: T[];
}

@Injectable({
  providedIn: 'root'
})

export class JamendoService {
  private baseUrl = environment.jamendo.baseUrl;
  private version = environment.jamendo.version;
  private clientId = environment.jamendo.clientId;

  constructor(private http: HttpClient) {}

  getTracks(options: {
    orderBy?: 'trending' | 'popularity' | 'releasedate';
    limit?: number;
    tags?: string[];
  } = {}): Observable<JamendoTrack[]> {
    let params = new HttpParams()
      .set('client_id', this.clientId)
      .set('format', 'json')
      .set('limit', options.limit?.toString() || '100')
      .set('order', options.orderBy || 'releasedate');

    if (options.tags && options.tags.length > 0) {
      params = params.set('tags', options.tags.join(' '));
    }

    return this.http.get<JamendoResponse<JamendoTrack>>(
      `${this.baseUrl}/${this.version}/tracks`,
      { params }
    ).pipe(
      map(response => response.results),
      catchError(this.handleError)
    );
  }

  searchTracks(query: string, limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.clientId)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('namesearch', query);

    return this.http.get<JamendoResponse<JamendoTrack>>(
      `${this.baseUrl}/${this.version}/tracks`,
      { params }
    ).pipe(
      map(response => response.results),
      catchError(this.handleError)
    );
  }

  getRandomTracks(limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.clientId)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('orderby', 'random');

    return this.http.get<JamendoResponse<JamendoTrack>>(
      `${this.baseUrl}/${this.version}/tracks`,
      { params }
    ).pipe(
      map(response => response.results),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => error.error?.error_message || 'Server error');
  }
}
