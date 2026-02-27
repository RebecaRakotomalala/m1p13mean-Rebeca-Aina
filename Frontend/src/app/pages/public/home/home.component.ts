import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  stats = { boutiques: 0, produits: 0, clients: 0, commandes: 0, categories: 0 };
  loading = true;

  // For animated counters
  animatedStats = { boutiques: 0, produits: 0, clients: 0, commandes: 0, categories: 0 };

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.http.get<any>(`${this.apiUrl}/home/stats`).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.stats = res.stats;
          this.animateCounters();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Home] Error loading stats:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  animateCounters(): void {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      this.animatedStats = {
        boutiques: Math.round(this.stats.boutiques * ease),
        produits: Math.round(this.stats.produits * ease),
        clients: Math.round(this.stats.clients * ease),
        commandes: Math.round(this.stats.commandes * ease),
        categories: Math.round(this.stats.categories * ease)
      };
      this.cdr.detectChanges();

      if (step >= steps) {
        clearInterval(timer);
        this.animatedStats = { ...this.stats };
        this.cdr.detectChanges();
      }
    }, interval);
  }
}
