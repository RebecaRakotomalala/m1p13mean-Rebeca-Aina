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
      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatut" (change)="loadCommandes()">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirmee">Confirmee</option>
            <option value="en_preparation">En preparation</option>
            <option value="prete">Prete</option>
            <option value="en_livraison">En livraison</option>
            <option value="livree">Livree</option>
            <option value="annulee">Annulee</option>
          </select>
        </div>
        <div class="col-md-3">
          <div class="text-muted small pt-2">
            {{ total }} commande(s) trouvee(s) - Page {{ page }}/{{ pages }}
          </div>
        </div>
        <div class="col-md-3 ms-auto text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" [disabled]="page <= 1" (click)="page = page - 1; loadCommandes()">
            <i class="ti ti-chevron-left"></i> Prec.
          </button>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="page >= pages" (click)="page = page + 1; loadCommandes()">
            Suiv. <i class="ti ti-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
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
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-info btn-sm" (click)="showDetail(cmd)" title="Detail">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'en_attente'" class="btn btn-outline-success btn-sm" (click)="updateStatut(cmd._id, 'confirmee')" title="Confirmer">
                    <i class="ti ti-check"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'confirmee'" class="btn btn-outline-primary btn-sm" (click)="updateStatut(cmd._id, 'en_preparation')" title="En preparation">
                    <i class="ti ti-box"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'en_preparation'" class="btn btn-outline-success btn-sm" (click)="updateStatut(cmd._id, 'prete')" title="Prete">
                    <i class="ti ti-package"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'prete'" class="btn btn-outline-info btn-sm" (click)="updateStatut(cmd._id, 'en_livraison')" title="En livraison">
                    <i class="ti ti-truck"></i>
                  </button>
                  <button *ngIf="cmd.statut === 'en_livraison'" class="btn btn-outline-success btn-sm" (click)="updateStatut(cmd._id, 'livree')" title="Livree">
                    <i class="ti ti-check-all"></i>
                  </button>
                  <button *ngIf="!['annulee','livree','remboursee'].includes(cmd.statut)" class="btn btn-outline-danger btn-sm" (click)="annulerCommande(cmd._id)" title="Annuler">
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="commandes.length === 0" class="text-center text-muted py-4">Aucune commande trouvee</div>
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
  `
})
export class AdminCommandesComponent implements OnInit {
  commandes: any[] = [];
  filterStatut = '';
  page = 1;
  pages = 1;
  total = 0;
  selectedCommande: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadCommandes(); }

  loadCommandes(): void {
    const params: any = { page: this.page, limit: 15 };
    if (this.filterStatut) params.statut = this.filterStatut;
    this.api.getAllCommandes(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.commandes = res.commandes;
          this.total = res.total;
          this.pages = res.pages;
          this.page = res.page;
        }
      },
      error: (err) => console.error(err)
    });
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
