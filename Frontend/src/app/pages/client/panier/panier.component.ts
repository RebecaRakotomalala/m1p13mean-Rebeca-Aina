import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-panier',
  imports: [CommonModule, FormsModule, RouterModule, CardComponent],
  template: `
    <div class="row">
      <div class="col-md-8">
        <app-card cardTitle="Mon Panier">
          <div *ngIf="panier && panier.items.length > 0">
            <div *ngFor="let item of panier.items" class="d-flex align-items-center border-bottom py-3">
              <img [src]="item.produit?.image_principale || 'assets/images/authentication/img-placeholder.svg'" style="width:80px;height:80px;object-fit:cover;border-radius:8px;" class="me-3" />
              <div class="flex-grow-1">
                <h6 class="mb-0">{{ item.produit?.nom }}</h6>
                <small class="text-muted">{{ item.produit?.boutique_id?.nom }}</small>
                <div class="mt-1"><strong class="text-primary">{{ item.prix_unitaire | number:'1.0-0' }} Ar</strong></div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" (click)="updateQty(item._id, item.quantite - 1)" [disabled]="item.quantite <= 1">-</button>
                <span class="fw-bold">{{ item.quantite }}</span>
                <button class="btn btn-sm btn-outline-secondary" (click)="updateQty(item._id, item.quantite + 1)">+</button>
              </div>
              <div class="ms-3 text-end" style="min-width:100px;">
                <strong>{{ item.sous_total | number:'1.0-0' }} Ar</strong>
                <br>
                <button class="btn btn-sm btn-outline-danger mt-1" (click)="removeItem(item._id)">Retirer</button>
              </div>
            </div>
          </div>
          <div *ngIf="!panier || panier.items.length === 0" class="text-center py-5">
            <h5 class="text-muted">Votre panier est vide</h5>
            <a [routerLink]="['/client/catalogue']" class="btn btn-primary mt-2">Parcourir le catalogue</a>
          </div>
        </app-card>
      </div>

      <div class="col-md-4" *ngIf="panier && panier.items.length > 0">
        <app-card cardTitle="Resume">
          <div class="d-flex justify-content-between mb-2">
            <span>Sous-total ({{ panier.nombre_items }} articles)</span>
            <strong>{{ panier.total | number:'1.0-0' }} Ar</strong>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Livraison</span>
            <span>{{ modeLivraison === 'livraison_domicile' ? '5 000 Ar' : 'Gratuit' }}</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between mb-3">
            <strong>Total</strong>
            <strong class="text-primary h5">{{ (panier.total + (modeLivraison === 'livraison_domicile' ? 5000 : 0)) | number:'1.0-0' }} Ar</strong>
          </div>

          <div class="mb-3">
            <label class="form-label">Mode de livraison</label>
            <select class="form-select" [(ngModel)]="modeLivraison">
              <option value="retrait_boutique">Retrait en boutique (Gratuit)</option>
              <option value="livraison_domicile">Livraison a domicile (5 000 Ar)</option>
            </select>
          </div>

          <div class="mb-3" *ngIf="modeLivraison === 'livraison_domicile'">
            <label class="form-label">Adresse de livraison</label>
            <textarea class="form-control" rows="2" [(ngModel)]="adresse" placeholder="Votre adresse..."></textarea>
          </div>

          <button class="btn btn-primary w-100" (click)="commander()" [disabled]="loading">
            {{ loading ? 'Commande en cours...' : 'Passer la commande' }}
          </button>
        </app-card>
      </div>
    </div>
  `
})
export class PanierComponent implements OnInit {
  panier: any = null;
  modeLivraison = 'retrait_boutique';
  adresse = '';
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void { this.loadPanier(); }

  loadPanier(): void {
    this.api.getPanier().subscribe({
      next: (res) => { if (res.success) this.panier = res.panier; },
      error: (err) => console.error(err)
    });
  }

  updateQty(ligneId: string, qty: number): void {
    if (qty < 1) return;
    this.api.updatePanierItem(ligneId, qty).subscribe({ next: () => this.loadPanier() });
  }

  removeItem(ligneId: string): void {
    this.api.removePanierItem(ligneId).subscribe({ next: () => this.loadPanier() });
  }

  commander(): void {
    this.loading = true;
    const data: any = {
      mode_livraison: this.modeLivraison,
      methode_paiement: 'especes'
    };
    if (this.modeLivraison === 'livraison_domicile' && this.adresse) {
      data.adresse_livraison = { rue: this.adresse, ville: 'Antananarivo', pays: 'Madagascar' };
    }
    this.api.createCommande(data).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          alert('Commande creee avec succes ! N*' + res.commande.numero_commande);
          this.router.navigate(['/client/commandes']);
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Erreur lors de la commande');
      }
    });
  }
}
