import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTestService, TestResult } from '../../../services/api-test.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-test-connection',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './test-connection.component.html',
  styleUrls: ['./test-connection.component.scss']
})
export class TestConnectionComponent implements OnInit {
  connectionTest: TestResult | null = null;
  mongodbTest: TestResult | null = null;
  postTest: TestResult | null = null;
  
  loading = {
    connection: false,
    mongodb: false,
    post: false
  };

  errors = {
    connection: '',
    mongodb: '',
    post: ''
  };

  constructor(private apiTestService: ApiTestService) {}

  ngOnInit(): void {
    this.testAll();
  }

  testAll(): void {
    this.testConnection();
    this.testMongoDB();
    this.testPost();
  }

  testConnection(): void {
    this.loading.connection = true;
    this.errors.connection = '';
    this.apiTestService.testConnection().subscribe({
      next: (result) => {
        this.connectionTest = result;
        this.loading.connection = false;
      },
      error: (error) => {
        this.errors.connection = error.message || 'Erreur de connexion';
        this.loading.connection = false;
        console.error('Erreur test connexion:', error);
      }
    });
  }

  testMongoDB(): void {
    this.loading.mongodb = true;
    this.errors.mongodb = '';
    this.apiTestService.testMongoDB().subscribe({
      next: (result) => {
        this.mongodbTest = result;
        this.loading.mongodb = false;
      },
      error: (error) => {
        this.errors.mongodb = error.message || 'Erreur de connexion MongoDB';
        this.loading.mongodb = false;
        console.error('Erreur test MongoDB:', error);
      }
    });
  }

  testPost(): void {
    this.loading.post = true;
    this.errors.post = '';
    const testData = { message: 'Test depuis le frontend', timestamp: new Date().toISOString() };
    this.apiTestService.testPostData(testData).subscribe({
      next: (result) => {
        this.postTest = result;
        this.loading.post = false;
      },
      error: (error) => {
        this.errors.post = error.message || 'Erreur lors de l\'envoi des données';
        this.loading.post = false;
        console.error('Erreur test POST:', error);
      }
    });
  }
}

