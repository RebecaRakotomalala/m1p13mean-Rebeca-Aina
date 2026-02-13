import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-boutique-detail',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" *ngIf="boutique">
      <!-- Header boutique -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                 style="width:80px;height:80px;font-size:32px;flex-shrink:0;">
              {{ boutique.nom?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <h2 class="mb-1">{{ boutique.nom }}</h2>
              <span class="badge bg-light text-dark me-2">{{ boutique.categorie_principale }}</span>
              <span *ngIf="boutique.note_moyenne > 0" class="text-warning">★ {{ boutique.note_moyenne | number:'1.1-1' }}/5</span>
              <span class="text-muted ms-1" *ngIf="boutique.nombre_avis">({{ boutique.nombre_avis }} avis)</span>
              <p class="text-muted mb-0 mt-1" *ngIf="boutique.description_courte">{{ boutique.description_courte }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Produits de la boutique -->
      <h4 class="mb-3">Produits de cette boutique</h4>
      <div class="row">
        <div class="col-6 col-md-4 col-lg-3 mb-4" *ngFor="let p of produits">
          <div class="card h-100 product-card" [routerLink]="['/catalogue/produit', p._id]" style="cursor:pointer;">
            <img [src]="p.image_principale || 'assets/images/authentication/img-placeholder.svg'"
                 class="card-img-top" style="height:180px;object-fit:cover;" [alt]="p.nom" />
            <div class="card-body p-2">
              <h6 class="card-title mb-1 text-truncate">{{ p.nom }}</h6>
              <div>
                <span *ngIf="p.prix_promo" class="text-decoration-line-through text-muted small me-1">{{ p.prix_initial | number:'1.0-0' }} Ar</span>
                <strong class="text-primary">{{ (p.prix_promo || p.prix_initial) | number:'1.0-0' }} Ar</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="produits.length === 0 && !loading" class="text-center text-muted py-4">
        <p>Cette boutique n'a pas encore de produits.</p>
      </div>
    </div>
    <div *ngIf="!boutique && !loading" class="container py-5 text-center">
      <h4>Boutique non trouvee</h4>
      <a routerLink="/boutiques" class="btn btn-primary mt-2">Retour aux boutiques</a>
    </div>
    <div *ngIf="loading" class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `,
  styles: [`
    .product-card {
      border: 1px solid #eee;
      transition: all 0.2s ease;
      &:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateY(-3px); }
    }
  `]
})
export class BoutiqueDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  boutique: any = null;
  produits: any[] = [];
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`http://localhost:3000/api/boutiques/${id}`).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) this.boutique = res.boutique;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[BoutiqueDetail] Error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
      this.http.get<any>(`http://localhost:3000/api/produits/boutique/${id}`).subscribe({
        next: (res) => {
          if (res.success) this.produits = res.produits;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[BoutiqueDetail] Produits Error:', err);
        }
      });
    } else {
      this.loading = false;
    }
  }
}
