import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-boutique-dashboard',
  imports: [CommonModule, RouterModule, CardComponent],
  template: `
    <div class="row" *ngIf="stats">
      <div class="col-md-4 col-xl-3">
        <app-card cardTitle="Produits" cardClass="comp-card">
          <h3 class="mb-0">{{ stats.totalProduits }}</h3>
          <p class="text-muted mb-0">Produits actifs</p>
          <a [routerLink]="['/boutique/produits']" class="btn btn-outline-primary btn-sm mt-2">Gerer</a>
        </app-card>
      </div>
      <div class="col-md-4 col-xl-3">
        <app-card cardTitle="Ventes" cardClass="comp-card">
          <h3 class="mb-0">{{ (stats.totalVentes || 0) | number:'1.0-0' }} Ar</h3>
          <p class="text-muted mb-0">{{ stats.commandesCount }} commandes</p>
        </app-card>
      </div>
      <div class="col-md-4 col-xl-3">
        <app-card cardTitle="En attente" cardClass="comp-card">
          <h3 class="mb-0 text-warning">{{ stats.commandesEnAttente }}</h3>
          <p class="text-muted mb-0">Commandes en attente</p>
          <a [routerLink]="['/boutique/commandes']" class="btn btn-outline-warning btn-sm mt-2">Voir</a>
        </app-card>
      </div>
      <div class="col-md-4 col-xl-3">
        <app-card cardTitle="Avis" cardClass="comp-card">
          <h3 class="mb-0">{{ stats.totalAvis }}</h3>
          <p class="text-muted mb-0">Avis clients</p>
        </app-card>
      </div>
    </div>

    <div class="row" *ngIf="stats?.boutiques?.length > 0">
      <div class="col-12">
        <app-card cardTitle="Mes Boutiques">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead><tr><th>Nom</th><th>Categorie</th><th>Statut</th><th>Note</th><th>Vues</th></tr></thead>
              <tbody>
                <tr *ngFor="let b of stats.boutiques">
                  <td><strong>{{ b.nom }}</strong></td>
                  <td>{{ b.categorie_principale }}</td>
                  <td><span class="badge" [ngClass]="b.statut === 'active' ? 'bg-success' : 'bg-warning'">{{ b.statut }}</span></td>
                  <td>{{ b.note_moyenne | number:'1.1-1' }}/5</td>
                  <td>{{ b.nombre_vues }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>
      </div>
    </div>

    <div *ngIf="!stats" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Chargement...</p>
    </div>
  `
})
export class BoutiqueDashboardComponent implements OnInit {
  stats: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getBoutiqueStats().subscribe({
      next: (res) => { if (res.success) this.stats = res.stats; },
      error: (err) => console.error(err)
    });
  }
}
