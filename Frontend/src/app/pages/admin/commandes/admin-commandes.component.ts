import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-commandes',
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <app-card cardTitle="Gestion des Commandes">
      <!-- Filtres -->
      <div class="admin-filters-panel mb-3">
        <div class="row g-2 align-items-end">
          <div class="col-xl-4 col-md-6">
            <label class="admin-filter-label">Recherche</label>
            <input
              type="text"
              class="form-control admin-filter-control"
              placeholder="N° commande, client, email..."
              [(ngModel)]="search"
              (input)="onSearchInput()"
            />
          </div>
          <div class="col-xl-2 col-md-3">
            <label class="admin-filter-label">Statut</label>
            <select class="form-select admin-filter-control" [(ngModel)]="filterStatut" (change)="onFilterChange()">
              <option value="">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmee</option>
              <option value="en_preparation">En preparation</option>
              <option value="prete">Prete</option>
              <option value="en_livraison">En livraison</option>
              <option value="livree">Livree</option>
              <option value="annulee">Annulee</option>
            </select>
          </div>
          <div class="col-xl-2 col-md-3">
            <label class="admin-filter-label">Paiement</label>
            <select class="form-select admin-filter-control" [(ngModel)]="filterPaiement" (change)="onFilterChange()">
              <option value="">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="paye">Paye</option>
              <option value="echoue">Echoue</option>
              <option value="rembourse">Rembourse</option>
            </select>
          </div>
          <div class="col-xl-2 col-md-3">
            <label class="admin-filter-label">Livraison</label>
            <select class="form-select admin-filter-control" [(ngModel)]="filterModeLivraison" (change)="onFilterChange()">
              <option value="">Tous</option>
              <option value="retrait_boutique">Retrait boutique</option>
              <option value="livraison_domicile">Domicile</option>
              <option value="consigne_automatique">Consigne auto</option>
            </select>
          </div>
          <div class="col-xl-2 col-md-3">
            <label class="admin-filter-label">Date debut</label>
            <input type="date" class="form-control admin-filter-control" [(ngModel)]="dateFrom" (change)="onFilterChange()" />
          </div>
          <div class="col-xl-2 col-md-3">
            <label class="admin-filter-label">Date fin</label>
            <input type="date" class="form-control admin-filter-control" [(ngModel)]="dateTo" (change)="onFilterChange()" />
          </div>
          <div class="col-xl-2 col-md-3">
            <button class="btn btn-sm btn-outline-secondary w-100 admin-reset-btn" (click)="resetFilters()" [disabled]="loading">
              <i class="ti ti-refresh me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-md-12">
          <div class="text-muted small admin-table-meta">
            {{ total }} commande(s) trouvee(s) - Page {{ page }}/{{ pages }}
          </div>
        </div>
      </div>
      <div class="row mb-2" *ngIf="hasActiveFilters()">
        <div class="col-md-12">
          <div class="admin-active-filters">
            <span class="badge bg-light-primary text-primary border" *ngIf="search">Recherche: {{ search }}</span>
            <span class="badge bg-light-secondary text-secondary border" *ngIf="filterStatut">Statut: {{ filterStatut }}</span>
            <span class="badge bg-light-secondary text-secondary border" *ngIf="filterPaiement">Paiement: {{ filterPaiement }}</span>
            <span class="badge bg-light-secondary text-secondary border" *ngIf="filterModeLivraison">Livraison: {{ filterModeLivraison }}</span>
            <span class="badge bg-light-warning text-warning border" *ngIf="dateFrom">Du: {{ dateFrom }}</span>
            <span class="badge bg-light-warning text-warning border" *ngIf="dateTo">Au: {{ dateTo }}</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive admin-table-wrapper">
        <table class="table table-hover align-middle admin-table mb-0">
          <thead class="admin-table-head">
            <tr>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Mode livraison</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td colspan="8" class="text-center text-muted py-5">Chargement des commandes...</td>
            </tr>
            <tr *ngIf="!loading && commandes.length === 0">
              <td colspan="8" class="text-center text-muted py-5">Aucune commande trouvee</td>
            </tr>
            <tr *ngFor="let cmd of commandes">
              <td><code>{{ cmd.numero_commande }}</code></td>
              <td>
                <strong>{{ cmd.client_nom || 'N/A' }}</strong>
                <br><small class="text-muted">{{ cmd.client_email }}</small>
              </td>
              <td><strong>{{ cmd.montant_total | number:'1.0-0' }} Ar</strong></td>
              <td><small>{{ cmd.mode_livraison || '-' }}</small></td>
              <td>
                <span class="badge" [ngClass]="getPaiementClass(cmd.statut_paiement)">{{ cmd.statut_paiement }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="getStatutClass(cmd.statut)">{{ cmd.statut }}</span>
              </td>
              <td><small>{{ cmd.date_creation | date:'dd/MM/yy HH:mm' }}</small></td>
              <td>
                <div class="btn-group btn-group-sm admin-actions">
                  <button class="btn btn-outline-info btn-sm admin-icon-btn" (click)="showDetail(cmd)" title="Detail">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'en_attente'" class="btn btn-outline-success btn-sm admin-icon-btn" (click)="updateStatut(cmd._id, 'confirmee')" title="Confirmer">
                    <i class="ti ti-check"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'confirmee'" class="btn btn-outline-primary btn-sm admin-icon-btn" (click)="updateStatut(cmd._id, 'en_preparation')" title="En preparation">
                    <i class="ti ti-box"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'en_preparation'" class="btn btn-outline-success btn-sm admin-icon-btn" (click)="updateStatut(cmd._id, 'prete')" title="Prete">
                    <i class="ti ti-package"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'prete'" class="btn btn-outline-info btn-sm admin-icon-btn" (click)="updateStatut(cmd._id, 'en_livraison')" title="En livraison">
                    <i class="ti ti-truck"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'en_livraison'" class="btn btn-outline-success btn-sm admin-icon-btn" (click)="updateStatut(cmd._id, 'livree')" title="Livree">
                    <i class="ti ti-check-all"></i>
                  </button>
                  <button *ngIf="!['annulee','livree','remboursee'].includes(cmd.statut)" class="btn btn-outline-danger btn-sm admin-icon-btn" (click)="annulerCommande(cmd._id)" title="Annuler">
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-flex justify-content-between align-items-center gap-2 mt-3">
        <small class="text-muted">Affichage: {{ commandes.length }} / {{ total }}</small>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light-secondary text-secondary border">Page {{ page }} / {{ pages }}</span>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page <= 1" (click)="page = page - 1; loadCommandes()">
            Prec.
          </button>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page >= pages" (click)="page = page + 1; loadCommandes()">
            Suiv.
          </button>
        </div>
      </div>
    </app-card>

    <!-- Modal Detail -->
    <div *ngIf="selectedCommande" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Commande {{ selectedCommande.numero_commande }}</h5>
            <button type="button" class="btn-close" (click)="selectedCommande = null"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Client</h6>
                <p class="mb-1"><strong>{{ selectedCommande.client_nom }}</strong></p>
                <p class="mb-1 text-muted">{{ selectedCommande.client_email }}</p>
                <p class="mb-0 text-muted">{{ selectedCommande.client_telephone || '-' }}</p>
              </div>
              <div class="col-md-6">
                <h6>Informations</h6>
                <p class="mb-1">Statut: <span class="badge" [ngClass]="getStatutClass(selectedCommande.statut)">{{ selectedCommande.statut }}</span></p>
                <p class="mb-1">Paiement: <span class="badge" [ngClass]="getPaiementClass(selectedCommande.statut_paiement)">{{ selectedCommande.statut_paiement }}</span></p>
                <p class="mb-0">Mode: {{ selectedCommande.mode_livraison || '-' }}</p>
              </div>
            </div>
            <hr>
            <h6>Produits</h6>
            <div class="table-responsive" *ngIf="selectedCommande.lignes?.length > 0">
              <table class="table table-sm">
                <thead><tr><th>Produit</th><th>Boutique</th><th>Qte</th><th>Prix</th><th>Total</th></tr></thead>
                <tbody>
                  <tr *ngFor="let l of selectedCommande.lignes">
                    <td>{{ l.nom_produit }}</td>
                    <td>{{ l.boutique_id?.nom || '-' }}</td>
                    <td>{{ l.quantite }}</td>
                    <td>{{ l.prix_unitaire | number:'1.0-0' }} Ar</td>
                    <td><strong>{{ l.prix_total | number:'1.0-0' }} Ar</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr>
            <div class="row">
              <div class="col-md-6">
                <p *ngIf="selectedCommande.note_client"><strong>Note client:</strong> {{ selectedCommande.note_client }}</p>
              </div>
              <div class="col-md-6 text-end">
                <p class="mb-1">Sous-total: {{ selectedCommande.sous_total | number:'1.0-0' }} Ar</p>
                <p class="mb-1">Frais livraison: {{ selectedCommande.frais_livraison | number:'1.0-0' }} Ar</p>
                <h5 class="text-primary">Total: {{ selectedCommande.montant_total | number:'1.0-0' }} Ar</h5>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="selectedCommande = null">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-filter-control {
      border-radius: 10px;
      min-height: 40px;
      border-color: #dfe3eb;
    }
    .admin-filters-panel {
      border: 1px solid #edf1f7;
      border-radius: 12px;
      background: #fbfcff;
      padding: 12px;
    }
    .admin-filter-label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #6b7886;
      text-transform: uppercase;
    }
    .admin-filter-control:focus {
      border-color: #04a9f5;
      box-shadow: 0 0 0 0.2rem rgba(4, 169, 245, 0.15);
    }
    .admin-reset-btn {
      min-height: 40px;
      border-radius: 10px;
    }
    .admin-table-meta {
      display: inline-block;
      padding-top: 10px;
    }
    .admin-table-wrapper {
      border: 1px solid #edf1f7;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
    }
    .admin-table-head th {
      background: #f8f9fc;
      border-bottom: 1px solid #edf1f7;
      font-size: 0.78rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: #5b6b79;
      white-space: nowrap;
    }
    .admin-table tbody tr {
      border-bottom: 1px solid #f1f4f9;
    }
    .admin-table tbody tr:last-child {
      border-bottom: 0;
    }
    .admin-actions .admin-icon-btn {
      border-radius: 8px;
      min-width: 34px;
    }
    .admin-active-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
  `]
})
export class AdminCommandesComponent implements OnInit {
  commandes: any[] = [];
  filterStatut = '';
  filterPaiement = '';
  filterModeLivraison = '';
  search = '';
  dateFrom = '';
  dateTo = '';
  loading = false;
  page = 1;
  pages = 1;
  total = 0;
  selectedCommande: any = null;
  private searchTimer: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadCommandes(); }

  loadCommandes(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: 15 };
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.filterPaiement) params.statut_paiement = this.filterPaiement;
    if (this.filterModeLivraison) params.mode_livraison = this.filterModeLivraison;
    if (this.search) params.search = this.search;
    if (this.dateFrom) params.dateFrom = this.dateFrom;
    if (this.dateTo) params.dateTo = this.dateTo;
    this.api.getAllCommandes(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.commandes = res.commandes;
          this.total = res.total;
          this.pages = res.pages;
          this.page = res.page;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadCommandes();
  }

  onSearchInput(): void {
    this.page = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadCommandes(), 300);
  }

  resetFilters(): void {
    this.filterStatut = '';
    this.filterPaiement = '';
    this.filterModeLivraison = '';
    this.search = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.page = 1;
    this.loadCommandes();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.search ||
      this.filterStatut ||
      this.filterPaiement ||
      this.filterModeLivraison ||
      this.dateFrom ||
      this.dateTo
    );
  }

  showDetail(cmd: any): void {
    this.api.getCommandeById(cmd._id).subscribe({
      next: (res) => { if (res.success) this.selectedCommande = res.commande; },
      error: (err) => console.error(err)
    });
  }

  updateStatut(id: string, statut: string): void {
    this.api.updateStatutCommande(id, statut).subscribe({
      next: () => { this.loadCommandes(); this.selectedCommande = null; }
    });
  }

  annulerCommande(id: string): void {
    if (confirm('Voulez-vous vraiment annuler cette commande ?')) {
      this.api.updateStatutCommande(id, 'annulee', 'Annulee par admin').subscribe({
        next: () => this.loadCommandes()
      });
    }
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'en_attente': 'bg-warning', 'confirmee': 'bg-info', 'en_preparation': 'bg-primary',
      'prete': 'bg-success', 'en_livraison': 'bg-info', 'livree': 'bg-success', 'annulee': 'bg-danger', 'remboursee': 'bg-secondary'
    };
    return classes[statut] || 'bg-secondary';
  }

  getPaiementClass(statut: string): string {
    const classes: any = {
      'en_attente': 'bg-warning', 'paye': 'bg-success', 'echoue': 'bg-danger', 'rembourse': 'bg-secondary'
    };
    return classes[statut] || 'bg-secondary';
  }
}
