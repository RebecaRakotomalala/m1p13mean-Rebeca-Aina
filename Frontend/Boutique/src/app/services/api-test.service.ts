import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TestResult {
  message: string;
  status: string;
  timestamp?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiTestService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Test de connexion Frontend-Backend
  testConnection(): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.apiUrl}/test/connection`);
  }

  // Test de connexion MongoDB
  testMongoDB(): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.apiUrl}/test/mongodb`);
  }

  // Test d'envoi de données (POST)
  testPostData(data: any): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.apiUrl}/test/data`, data);
  }
}

