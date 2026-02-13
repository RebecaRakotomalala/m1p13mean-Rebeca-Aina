import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-favoris',
  imports: [CommonModule, RouterModule, CardComponent],
  template: `
    <app-card cardTitle="Mes Favoris">
      <div class="row">
        <div class="col-md-4 col-lg-3 mb-4" *ngFor="let f of favoris">
          <div class="card h-100">
            <div *ngIf="f.type === 'produit' && f.produit_id">
              <img [src]="f.produit_id.image_principale || 'assets/images/authentication/img-placeholder.svg'" class="card-img-top" style="height:180px;object-fit:cover;" />
              <div class="card-body">
                <h6 class="card-title">{{ f.produit_id.nom }}</h6>
                <strong class="text-primary">{{ (f.produit_id.prix_promo || f.produit_id.prix_initial) | number:'1.0-0' }} Ar</strong>
                <div class="mt-2">
                  <a [routerLink]="['/client/produit', f.produit_id._id]" class="btn btn-sm btn-outline-primary me-1">Voir</a>
                  <button class="btn btn-sm btn-outline-danger" (click)="removeFavori(f)">Retirer</button>
                </div>
              </div>
            </div>
            <div *ngIf="f.type === 'boutique' && f.boutique_id" class="card-body">
              <h6 class="card-title">{{ f.boutique_id.nom }}</h6>
              <p class="text-muted small">{{ f.boutique_id.categorie_principale }}</p>
              <span class="text-warning" *ngIf="f.boutique_id.note_moyenne">{{ f.boutique_id.note_moyenne | number:'1.1-1' }} ★</span>
              <div class="mt-2">
                <button class="btn btn-sm btn-outline-danger" (click)="removeFavori(f)">Retirer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="favoris.length === 0" class="text-center text-muted py-5">
        <h5>Aucun favori</h5>
        <p>Explorez le catalogue et ajoutez des produits en favoris !</p>
      </div>
    </app-card>
  `
})
export class FavorisComponent implements OnInit {
  favoris: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadFavoris(); }

  loadFavoris(): void {
    this.api.getMyFavoris().subscribe({
      next: (res) => { if (res.success) this.favoris = res.favoris; },
      error: (err) => console.error(err)
    });
  }

  removeFavori(f: any): void {
    this.api.toggleFavori(f.type, f.produit_id?._id, f.boutique_id?._id).subscribe({
      next: () => this.loadFavoris()
    });
  }
}
