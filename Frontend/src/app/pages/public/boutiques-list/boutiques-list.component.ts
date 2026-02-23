import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-boutiques-list',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">Nos Boutiques</h2>

      <!-- Filtre -->
      <div class="row mb-4">
        <div class="col-md-6">
          <input type="text" class="form-control" placeholder="Rechercher une boutique..." [(ngModel)]="search" (input)="filterBoutiques()" />
        </div>
      </div>

      <!-- Grille de boutiques -->
      <div class="row">
        <div class="col-md-4 col-lg-3 mb-4" *ngFor="let b of filteredBoutiques">
          <div class="card h-100 boutique-card" [routerLink]="['/boutiques', b._id]" style="cursor:pointer;">
            <div class="card-body text-center">
              <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                   style="width:70px;height:70px;font-size:28px;">
                {{ b.nom?.charAt(0)?.toUpperCase() }}
              </div>
              <h5 class="card-title">{{ b.nom }}</h5>
              <span class="badge bg-light text-dark mb-2">{{ b.categorie_principale }}</span>
              <p class="text-muted small mb-2" *ngIf="b.description_courte">{{ b.description_courte | slice:0:100 }}</p>
              <div class="d-flex justify-content-center gap-3 small text-muted mb-2">
                <span *ngIf="b.note_moyenne > 0"><span class="text-warning">★</span> {{ b.note_moyenne | number:'1.1-1' }}/5</span>
                <span *ngIf="b.nombre_avis">{{ b.nombre_avis }} avis</span>
              </div>
              <div class="mt-2">
                <span class="badge bg-success-subtle text-success" *ngIf="b.statut === 'active'">Ouverte</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="filteredBoutiques.length === 0 && !loading" class="text-center text-muted py-5">
        <h5>Aucune boutique trouvee</h5>
        <p>Essayez avec d'autres termes de recherche.</p>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    </div>
  `,
  styles: [`
    .boutique-card {
      border: 1px solid #eee;
      transition: all 0.2s ease;
      &:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateY(-3px); }
    }
  `]
})
export class BoutiquesListComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  boutiques: any[] = [];
  filteredBoutiques: any[] = [];
  search = '';
  loading = true;

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/api/boutiques').subscribe({
      next: (res) => {
        console.log('[BoutiquesList] Response:', res);
        this.loading = false;
        if (res.success) {
          this.boutiques = (res.boutiques || []).filter((b: any) => b.statut === 'active');
          this.filteredBoutiques = this.boutiques;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[BoutiquesList] Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterBoutiques(): void {
    const s = this.search.toLowerCase();
    this.filteredBoutiques = this.boutiques.filter(b =>
      b.nom?.toLowerCase().includes(s) ||
      b.categorie_principale?.toLowerCase().includes(s) ||
      b.description_courte?.toLowerCase().includes(s)
    );
  }
}
