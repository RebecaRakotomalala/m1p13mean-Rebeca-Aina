import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-catalogue',
  imports: [CommonModule, FormsModule, RouterModule, CardComponent],
  template: `
    <app-card cardTitle="Catalogue de Produits">
      <!-- Filtres -->
      <div class="row mb-4">
        <div class="col-md-4 mb-2">
          <input type="text" class="form-control" placeholder="Rechercher un produit..." [(ngModel)]="search" (input)="loadProduits()" />
        </div>
        <div class="col-md-3 mb-2">
          <select class="form-select" [(ngModel)]="sortBy" (change)="loadProduits()">
            <option value="">Trier par</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix decroissant</option>
            <option value="nom">Nom A-Z</option>
            <option value="populaire">Plus vendus</option>
            <option value="note">Mieux notes</option>
          </select>
        </div>
        <div class="col-md-2 mb-2">
          <input type="number" class="form-control" placeholder="Prix min" [(ngModel)]="minPrix" (change)="loadProduits()" />
        </div>
        <div class="col-md-2 mb-2">
          <input type="number" class="form-control" placeholder="Prix max" [(ngModel)]="maxPrix" (change)="loadProduits()" />
        </div>
      </div>

      <!-- Grille de produits -->
      <div class="row">
        <div class="col-md-4 col-lg-3 mb-4" *ngFor="let p of produits">
          <div class="card h-100 product-card" style="cursor:pointer;" [routerLink]="['/client/produit', p._id]">
            <img [src]="p.image_principale || 'assets/images/authentication/img-placeholder.svg'" class="card-img-top" style="height:200px;object-fit:cover;" alt="{{ p.nom }}" />
            <div class="card-body">
              <p class="text-muted small mb-1">{{ p.boutique_id?.nom }}</p>
              <h6 class="card-title mb-1">{{ p.nom }}</h6>
              <p class="text-muted small mb-2" *ngIf="p.description_courte">{{ p.description_courte | slice:0:60 }}...</p>
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span *ngIf="p.prix_promo" class="text-decoration-line-through text-muted small me-1">{{ p.prix_initial | number:'1.0-0' }} Ar</span>
                  <strong class="text-primary">{{ (p.prix_promo || p.prix_initial) | number:'1.0-0' }} Ar</strong>
                </div>
                <span class="badge bg-light text-dark" *ngIf="p.note_moyenne > 0">{{ p.note_moyenne | number:'1.1-1' }} ★</span>
              </div>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0">
              <button class="btn btn-primary btn-sm w-100" (click)="addToCart(p._id, $event)">Ajouter au panier</button>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="produits.length === 0" class="text-center text-muted py-5">Aucun produit trouve</div>

      <!-- Pagination -->
      <div class="d-flex justify-content-center" *ngIf="totalPages > 1">
        <nav>
          <ul class="pagination">
            <li class="page-item" [class.disabled]="currentPage === 1"><a class="page-link" (click)="goToPage(currentPage - 1)">Precedent</a></li>
            <li class="page-item" *ngFor="let p of getPages()" [class.active]="p === currentPage"><a class="page-link" (click)="goToPage(p)">{{ p }}</a></li>
            <li class="page-item" [class.disabled]="currentPage === totalPages"><a class="page-link" (click)="goToPage(currentPage + 1)">Suivant</a></li>
          </ul>
        </nav>
      </div>
    </app-card>
  `,
  styles: [`
    .product-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateY(-2px); transition: all 0.2s; }
  `]
})
export class CatalogueComponent implements OnInit {
  produits: any[] = [];
  search = '';
  sortBy = '';
  minPrix: number | null = null;
  maxPrix: number | null = null;
  currentPage = 1;
  totalPages = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadProduits(); }

  loadProduits(): void {
    const params: any = { page: this.currentPage, limit: 12 };
    if (this.search) params.search = this.search;
    if (this.sortBy) params.sort_by = this.sortBy;
    if (this.minPrix) params.min_prix = this.minPrix;
    if (this.maxPrix) params.max_prix = this.maxPrix;

    this.api.getProduits(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.produits = res.produits;
          this.totalPages = res.pages || 1;
        }
      },
      error: (err) => console.error(err)
    });
  }

  addToCart(produitId: string, event: Event): void {
    event.stopPropagation();
    this.api.addToPanier(produitId, 1).subscribe({
      next: (res) => { if (res.success) alert('Produit ajoute au panier !'); },
      error: (err) => alert(err.error?.message || 'Erreur')
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProduits();
    }
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }
}
