import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:9000/api/auth";
  constructor(private http: HttpClient) { }
  
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
      })
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  handleGoogleCallback(token: string): Observable<any> {
    localStorage.setItem('access_token', token);
    return of({ success: true, token: token });
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response: any) => {
        localStorage.setItem('access_token', response.accessToken);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

