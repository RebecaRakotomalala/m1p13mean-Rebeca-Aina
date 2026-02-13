import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, CardComponent],
  template: `
    <div class="row">
      <div class="col-md-4 col-xl-3" *ngFor="let card of statsCards">
        <app-card [cardTitle]="card.title" cardClass="comp-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h3 class="mb-0">{{ card.value }}</h3>
              <p class="text-muted mb-0">{{ card.label }}</p>
            </div>
            <div class="avtar avtar-l rounded-circle" [ngClass]="card.bgClass">
              <i class="ti" [ngClass]="card.icon"></i>
            </div>
          </div>
        </app-card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <app-card cardTitle="Boutiques en attente de validation">
          <div *ngIf="stats?.boutiquesEnAttente === 0" class="text-center text-muted py-3">
            Aucune boutique en attente
          </div>
          <div *ngIf="stats?.boutiquesEnAttente > 0" class="text-center py-3">
            <h4 class="text-warning">{{ stats.boutiquesEnAttente }} boutique(s) en attente</h4>
            <a [routerLink]="['/admin/boutiques']" class="btn btn-outline-primary btn-sm mt-2">Gerer les boutiques</a>
          </div>
        </app-card>
      </div>
      <div class="col-md-6">
        <app-card cardTitle="Commandes recentes">
          <div class="table-responsive" *ngIf="stats?.commandesRecentes?.length > 0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>N* Commande</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cmd of stats.commandesRecentes | slice:0:5">
                  <td>{{ $any(cmd).numero_commande }}</td>
                  <td>{{ $any(cmd).client_nom || 'N/A' }}</td>
                  <td>{{ $any(cmd).montant_total | number:'1.0-0' }} Ar</td>
                  <td><span class="badge" [ngClass]="getStatutClass($any(cmd).statut)">{{ $any(cmd).statut }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="!stats?.commandesRecentes?.length" class="text-center text-muted py-3">Aucune commande</div>
        </app-card>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  statsCards: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.stats;
          this.statsCards = [
            { title: 'Utilisateurs', value: this.stats.totalUsers, label: 'Total inscrits', bgClass: 'bg-light-primary', icon: 'ti-users' },
            { title: 'Boutiques', value: this.stats.totalBoutiques, label: this.stats.boutiquesActives + ' actives', bgClass: 'bg-light-success', icon: 'ti-building-store' },
            { title: 'Produits', value: this.stats.totalProduits, label: 'Produits actifs', bgClass: 'bg-light-warning', icon: 'ti-package' },
            { title: 'Commandes', value: this.stats.totalCommandes, label: this.stats.commandesEnAttente + ' en attente', bgClass: 'bg-light-danger', icon: 'ti-shopping-cart' },
            { title: 'CA Total', value: (this.stats.chiffreAffaires || 0).toLocaleString() + ' Ar', label: 'Chiffre d\'affaires', bgClass: 'bg-light-info', icon: 'ti-currency-dollar' },
            { title: 'Livrees', value: this.stats.commandesLivrees, label: 'Commandes livrees', bgClass: 'bg-light-success', icon: 'ti-check' }
          ];
        }
      },
      error: (err) => console.error('Erreur dashboard:', err)
    });
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'en_attente': 'bg-warning', 'confirmee': 'bg-info', 'en_preparation': 'bg-primary',
      'prete': 'bg-success', 'livree': 'bg-success', 'annulee': 'bg-danger'
    };
    return classes[statut] || 'bg-secondary';
  }
}
