import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-boutique-produits',
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <app-card [cardTitle]="showForm ? (editingProduit ? 'Modifier le Produit' : 'Ajouter un Produit') : 'Mes Produits'">
      <!-- Bouton ajouter -->
      <div class="mb-3" *ngIf="!showForm">
        <button class="btn btn-primary" (click)="showForm = true; resetForm()">+ Ajouter un produit</button>
      </div>

      <!-- Formulaire -->
      <div *ngIf="showForm">
        @if (errorMessage) {
          <div class="alert alert-danger">{{ errorMessage }}</div>
        }
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Nom *</label>
            <input type="text" class="form-control" [(ngModel)]="form.nom" />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Categorie *</label>
            <input type="text" class="form-control" [(ngModel)]="form.categorie" />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Prix (Ar) *</label>
            <input type="number" class="form-control" [(ngModel)]="form.prix_initial" />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Prix promo (Ar)</label>
            <input type="number" class="form-control" [(ngModel)]="form.prix_promo" />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Stock</label>
            <input type="number" class="form-control" [(ngModel)]="form.stock_quantite" />
          </div>
          <div class="col-12 mb-3">
            <label class="form-label">Description courte</label>
            <textarea class="form-control" rows="2" [(ngModel)]="form.description_courte"></textarea>
          </div>
          <div class="col-12 mb-3">
            <label class="form-label">Description longue</label>
            <textarea class="form-control" rows="3" [(ngModel)]="form.description_longue"></textarea>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">URL Image principale</label>
            <input type="text" class="form-control" [(ngModel)]="form.image_principale" />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Sous-categorie</label>
            <input type="text" class="form-control" [(ngModel)]="form.sous_categorie" />
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" (click)="saveProduit()" [disabled]="loading">
            {{ loading ? 'Enregistrement...' : (editingProduit ? 'Modifier' : 'Creer') }}
          </button>
          <button class="btn btn-secondary" (click)="showForm = false">Annuler</button>
        </div>
      </div>

      <!-- Liste -->
      <div *ngIf="!showForm" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr><th>Image</th><th>Nom</th><th>Categorie</th><th>Prix</th><th>Stock</th><th>Ventes</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of produits">
              <td><img [src]="p.image_principale || 'assets/images/authentication/img-placeholder.svg'" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" /></td>
              <td><strong>{{ p.nom }}</strong></td>
              <td>{{ p.categorie }}</td>
              <td>
                <span *ngIf="p.prix_promo" class="text-decoration-line-through text-muted me-1">{{ p.prix_initial | number:'1.0-0' }}</span>
                {{ (p.prix_promo || p.prix_initial) | number:'1.0-0' }} Ar
              </td>
              <td><span [ngClass]="p.stock_quantite < 5 ? 'text-danger fw-bold' : ''">{{ p.stock_quantite }}</span></td>
              <td>{{ p.nombre_ventes }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="editProduit(p)">Modifier</button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteProduit(p._id)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="produits.length === 0" class="text-center text-muted py-4">Aucun produit. Ajoutez votre premier produit !</div>
      </div>
    </app-card>
  `
})
export class BoutiqueProduitsComponent implements OnInit {
  produits: any[] = [];
  boutiques: any[] = [];
  showForm = false;
  editingProduit: any = null;
  loading = false;
  errorMessage = '';
  form: any = {};

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    const userId = this.auth.currentUser?.id;
    if (userId) {
      this.api.getMyBoutiques(userId).subscribe({
        next: (res) => { if (res.success) this.boutiques = res.boutiques; }
      });
    }
  }

  loadProduits(): void {
    this.api.getMyProduits().subscribe({
      next: (res) => { if (res.success) this.produits = res.produits; },
      error: (err) => console.error(err)
    });
  }

  resetForm(): void {
    this.editingProduit = null;
    this.errorMessage = '';
    this.form = { nom: '', categorie: '', prix_initial: 0, prix_promo: null, stock_quantite: 0, description_courte: '', description_longue: '', image_principale: '', sous_categorie: '' };
  }

  editProduit(p: any): void {
    this.editingProduit = p;
    this.showForm = true;
    this.form = { ...p };
  }

  saveProduit(): void {
    if (!this.form.nom || !this.form.categorie || !this.form.prix_initial) {
      this.errorMessage = 'Nom, categorie et prix sont requis';
      return;
    }
    this.loading = true;
    if (this.editingProduit) {
      this.api.updateProduit(this.editingProduit._id, this.form).subscribe({
        next: () => { this.loading = false; this.showForm = false; this.loadProduits(); },
        error: (err) => { this.loading = false; this.errorMessage = err.error?.message || 'Erreur'; }
      });
    } else {
      if (this.boutiques.length > 0) {
        this.form.boutique_id = this.boutiques[0]._id;
      }
      this.api.createProduit(this.form).subscribe({
        next: () => { this.loading = false; this.showForm = false; this.loadProduits(); },
        error: (err) => { this.loading = false; this.errorMessage = err.error?.message || 'Erreur'; }
      });
    }
  }

  deleteProduit(id: string): void {
    if (confirm('Supprimer ce produit ?')) {
      this.api.deleteProduit(id).subscribe({ next: () => this.loadProduits() });
    }
  }
}
