import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-boutique-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <app-card cardTitle="Commandes de ma boutique">
      <!-- Filtres -->
      <div class="mb-3">
        <div class="row g-2">
          <div class="col-md-4">
            <select class="form-select" [(ngModel)]="filterStatut" (ngModelChange)="applyFilters()">
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="en_preparation">En préparation</option>
              <option value="prete">Prête</option>
              <option value="en_livraison">En livraison</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div class="col-md-4">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Rechercher par numéro de commande..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
            >
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Chargement des commandes...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="alert alert-danger">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" (click)="loadCommandes()">Réessayer</button>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Produits</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cmd of commandesFiltrees">
              <td><strong>{{ cmd.numero_commande }}</strong></td>
              <td>
                <div>
                  <strong>{{ cmd.client_nom || 'N/A' }}</strong>
                  <br>
                  <small class="text-muted">{{ cmd.client_email || '' }}</small>
                </div>
              </td>
              <td>
                <div *ngFor="let l of cmd.lignes">
                  {{ l.nom_produit }} x{{ l.quantite }}
                </div>
              </td>
              <td><strong>{{ cmd.montant_total | number:'1.0-0' }} Ar</strong></td>
              <td>
                <span class="badge" [ngClass]="getStatutClass(cmd.statut)">
                  {{ getStatutLabel(cmd.statut) }}
                </span>
              </td>
              <td>{{ cmd.date_creation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <select 
                  class="form-select form-select-sm" 
                  style="width:auto;display:inline-block;" 
                  [ngModel]="cmd.statut" 
                  (ngModelChange)="updateStatut(cmd._id, $event)"
                >
                  <option value="en_attente">En attente</option>
                  <option value="confirmee">Confirmée</option>
                  <option value="en_preparation">En préparation</option>
                  <option value="prete">Prête</option>
                  <option value="en_livraison">En livraison</option>
                  <option value="livree">Livrée</option>
                  <option value="annulee">Annulée</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="commandesFiltrees.length === 0 && !loading" class="text-center text-muted py-5">
          <p>Aucune commande trouvée</p>
          <p *ngIf="filterStatut !== 'all'" class="small">Essayez de changer le filtre de statut</p>
        </div>
      </div>
    </app-card>
  `
})
export class BoutiqueCommandesComponent implements OnInit {
  private api = inject(ApiService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  commandes: any[] = [];
  commandesFiltrees: any[] = [];
  loading = false;
  error: string | null = null;
  filterStatut = 'all';
  searchTerm = '';

  ngOnInit(): void {
    // Vérifier si on vient du dashboard avec un filtre
    this.route.queryParams.subscribe(params => {
      if (params['statut']) {
        this.filterStatut = params['statut'];
      }
    });
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.error = null;

    this.api.getCommandesBoutique().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.commandes = res.commandes || [];
          this.applyFilters();
          if (this.commandes.length === 0) {
            this.notificationService.info('Aucune commande trouvée pour votre boutique');
          }
        } else {
          this.error = res.message || 'Erreur lors du chargement des commandes';
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || err.message || 'Erreur lors du chargement des commandes';
        this.error = errorMessage;
        this.notificationService.error(errorMessage);
        console.error('Erreur chargement commandes:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    // Filtre par statut
    if (this.filterStatut !== 'all') {
      filtered = filtered.filter(cmd => cmd.statut === this.filterStatut);
    }

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cmd => 
        cmd.numero_commande?.toLowerCase().includes(term) ||
        cmd.client_nom?.toLowerCase().includes(term) ||
        cmd.client_email?.toLowerCase().includes(term)
      );
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

    this.commandesFiltrees = filtered;
  }

  updateStatut(id: string, statut: string): void {
    this.api.updateStatutCommande(id, statut).subscribe({
      next: () => {
        this.notificationService.success('Statut de la commande mis à jour');
        this.loadCommandes();
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Erreur lors de la mise à jour';
        this.notificationService.error(errorMessage);
        console.error('Erreur mise à jour statut:', err);
      }
    });
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'bg-warning',
      'confirmee': 'bg-info',
      'en_preparation': 'bg-primary',
      'prete': 'bg-success',
      'en_livraison': 'bg-success',
      'livree': 'bg-success',
      'annulee': 'bg-danger'
    };
    return classes[statut] || 'bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_preparation': 'En préparation',
      'prete': 'Prête',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }
}
