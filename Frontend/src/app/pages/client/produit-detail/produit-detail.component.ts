import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-produit-detail',
  imports: [CommonModule, FormsModule, RouterModule, CardComponent],
  template: `
    <div *ngIf="produit" class="row">
      <div class="col-md-5">
        <img [src]="produit.image_principale || 'assets/images/authentication/img-placeholder.svg'" class="img-fluid rounded" style="width:100%;max-height:400px;object-fit:cover;" />
      </div>
      <div class="col-md-7">
        <app-card>
          <h2>{{ produit.nom }}</h2>
          <p class="text-muted mb-1">Par <a [routerLink]="['/client/catalogue']" class="text-primary">{{ produit.boutique_id?.nom }}</a></p>
          <p class="text-muted">{{ produit.categorie }} <span *ngIf="produit.sous_categorie">/ {{ produit.sous_categorie }}</span></p>

          <div class="mb-3">
            <span *ngIf="produit.prix_promo" class="text-decoration-line-through text-muted h5 me-2">{{ produit.prix_initial | number:'1.0-0' }} Ar</span>
            <span class="h3 text-primary fw-bold">{{ (produit.prix_promo || produit.prix_initial) | number:'1.0-0' }} Ar</span>
          </div>

          <div class="mb-3" *ngIf="produit.note_moyenne > 0">
            <span class="text-warning">★</span> {{ produit.note_moyenne | number:'1.1-1' }}/5
            <span class="text-muted ms-1">({{ produit.nombre_avis }} avis)</span>
          </div>

          <p *ngIf="produit.description_courte">{{ produit.description_courte }}</p>

          <div class="mb-3">
            <span [ngClass]="produit.stock_quantite > 0 ? 'text-success' : 'text-danger'">
              {{ produit.stock_quantite > 0 ? 'En stock (' + produit.stock_quantite + ')' : 'Rupture de stock' }}
            </span>
          </div>

          <div class="d-flex align-items-center gap-2 mb-3">
            <input type="number" class="form-control" style="width:80px;" [(ngModel)]="quantite" min="1" [max]="produit.stock_quantite" />
            <button class="btn btn-primary" (click)="addToCart()" [disabled]="produit.stock_quantite < 1">Ajouter au panier</button>
            <button class="btn btn-outline-danger" (click)="toggleFavori()">{{ isFavori ? '♥ Favori' : '♡ Favori' }}</button>
          </div>

          <div *ngIf="produit.description_longue" class="mt-3">
            <h5>Description</h5>
            <p>{{ produit.description_longue }}</p>
          </div>
        </app-card>
      </div>
    </div>

    <!-- Avis -->
    <div class="row mt-4" *ngIf="produit">
      <div class="col-12">
        <app-card cardTitle="Avis clients">
          <!-- Formulaire avis -->
          <div class="border rounded p-3 mb-3">
            <h6>Laisser un avis</h6>
            <div class="d-flex gap-2 mb-2">
              <button *ngFor="let n of [1,2,3,4,5]" class="btn btn-sm" [ngClass]="n <= newAvis.note ? 'btn-warning' : 'btn-outline-warning'" (click)="newAvis.note = n">★</button>
            </div>
            <textarea class="form-control mb-2" rows="2" placeholder="Votre commentaire..." [(ngModel)]="newAvis.commentaire"></textarea>
            <button class="btn btn-sm btn-primary" (click)="submitAvis()">Envoyer</button>
          </div>

          <div *ngFor="let a of avis" class="border-bottom py-2">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ a.client_id?.nom }}</strong>
                <span class="text-warning ms-2">{{ '★'.repeat(a.note) }}</span>
              </div>
              <small class="text-muted">{{ a.date_creation | date:'dd/MM/yyyy' }}</small>
            </div>
            <p class="mb-1">{{ a.commentaire }}</p>
            <div *ngIf="a.reponse_boutique" class="ms-4 p-2 bg-light rounded">
              <small class="text-primary fw-bold">Reponse boutique:</small>
              <p class="mb-0 small">{{ a.reponse_boutique }}</p>
            </div>
          </div>
          <div *ngIf="avis.length === 0" class="text-center text-muted py-3">Aucun avis pour ce produit</div>
        </app-card>
      </div>
    </div>

    <div *ngIf="!produit" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `
})
export class ProduitDetailComponent implements OnInit {
  produit: any = null;
  avis: any[] = [];
  quantite = 1;
  isFavori = false;
  newAvis = { note: 5, commentaire: '' };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getProduitById(id).subscribe({
        next: (res) => {
          if (res.success) this.produit = res.produit;
        }
      });
      this.api.getAvisByProduit(id).subscribe({
        next: (res) => { if (res.success) this.avis = res.avis; }
      });
      this.api.checkFavori('produit', id).subscribe({
        next: (res) => { this.isFavori = res.isFavori; },
        error: () => {}
      });
    }
  }

  addToCart(): void {
    this.api.addToPanier(this.produit._id, this.quantite).subscribe({
      next: () => alert('Produit ajoute au panier !'),
      error: (err) => alert(err.error?.message || 'Erreur')
    });
  }

  toggleFavori(): void {
    this.api.toggleFavori('produit', this.produit._id).subscribe({
      next: (res) => { this.isFavori = res.isFavori; }
    });
  }

  submitAvis(): void {
    if (!this.newAvis.commentaire) return;
    this.api.createAvis({
      type: 'produit',
      produit_id: this.produit._id,
      note: this.newAvis.note,
      commentaire: this.newAvis.commentaire
    }).subscribe({
      next: () => {
        this.newAvis = { note: 5, commentaire: '' };
        this.api.getAvisByProduit(this.produit._id).subscribe({
          next: (res) => { if (res.success) this.avis = res.avis; }
        });
      },
      error: (err) => alert(err.error?.message || 'Erreur')
    });
  }
}
