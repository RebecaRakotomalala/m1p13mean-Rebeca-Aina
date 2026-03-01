import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-boutiques',
  imports: [CommonModule, FormsModule, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card cardTitle="Gestion des Boutiques">
      <div class="row g-2 mb-3 align-items-center">
        <div class="col-md-3">
          <select class="form-select admin-filter-control" [(ngModel)]="filterStatut" (change)="onFilterChange()">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="active">Active</option>
            <option value="suspendue">Suspendue</option>
            <option value="fermee">Fermee</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control admin-filter-control" placeholder="Rechercher..." [(ngModel)]="search" (input)="onSearchInput()" />
        </div>
        <div class="col-md-5 ms-auto text-md-end">
          <span class="badge bg-warning me-1" *ngIf="countEnAttente > 0">{{ countEnAttente }} en attente</span>
          <span class="text-muted small admin-table-meta">{{ total }} boutique(s) - Page {{ page }}/{{ pages }}</span>
        </div>
      </div>
      <div class="table-responsive admin-table-wrapper">
        <table class="table table-hover align-middle admin-table mb-0">
          <thead class="admin-table-head">
            <tr>
              <th>Nom</th>
              <th>Categorie</th>
              <th>Proprietaire</th>
              <th>Emplacement</th>
              <th>Statut</th>
              <th>Note</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td colspan="7" class="text-center text-muted py-5">Chargement des boutiques...</td>
            </tr>
            <tr *ngIf="!loading && boutiques.length === 0">
              <td colspan="7" class="text-center text-muted py-5">Aucune boutique trouvee</td>
            </tr>
            <tr *ngFor="let b of boutiques">
              <td>
                <strong>{{ b.nom }}</strong>
                <br><small class="text-muted">{{ b.email_contact }}</small>
              </td>
              <td>{{ b.categorie_principale }}</td>
              <td>{{ b.utilisateur_id?.nom }} {{ b.utilisateur_id?.prenom }}</td>
              <td>
                <small *ngIf="b.numero_emplacement">{{ b.numero_emplacement }}</small>
                <small *ngIf="b.etage"> - Etage {{ b.etage }}</small>
                <small *ngIf="!b.numero_emplacement && !b.etage" class="text-muted">Non attribue</small>
              </td>
              <td><span class="badge" [ngClass]="getStatutClass(b.statut)">{{ b.statut }}</span></td>
              <td>{{ b.note_moyenne | number:'1.1-1' }}/5</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm admin-actions">
                  <button class="btn btn-sm btn-outline-info admin-icon-btn" (click)="showDetail(b)" title="Detail">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button *ngIf="b.statut === 'en_attente'" class="btn btn-sm btn-success admin-icon-btn" (click)="valider(b._id)" title="Valider">
                    <i class="ti ti-check"></i>
                  </button>
                  <button *ngIf="b.statut === 'en_attente'" class="btn btn-sm btn-danger admin-icon-btn" (click)="rejeter(b._id)" title="Rejeter">
                    <i class="ti ti-x"></i>
                  </button>
                  <button *ngIf="b.statut === 'active'" class="btn btn-sm btn-warning admin-icon-btn" (click)="suspendre(b._id)" title="Suspendre">
                    <i class="ti ti-ban"></i>
                  </button>
                  <button *ngIf="b.statut === 'suspendue'" class="btn btn-sm btn-success admin-icon-btn" (click)="valider(b._id)" title="Reactiver">
                    <i class="ti ti-check"></i>
                  </button>
                  <button *ngIf="b.statut === 'active'" class="btn btn-sm btn-outline-primary admin-icon-btn" (click)="openEmplacement(b)" title="Emplacement">
                    <i class="ti ti-map-pin"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-flex justify-content-between align-items-center gap-2 mt-3">
        <small class="text-muted">Affichage: {{ boutiques.length }} / {{ total }}</small>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light-secondary text-secondary border">Page {{ page }} / {{ pages }}</span>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page <= 1" (click)="goToPrevPage()">Prec.</button>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page >= pages" (click)="goToNextPage()">Suiv.</button>
        </div>
      </div>
    </app-card>

    <!-- Modal Detail Boutique -->
    <div *ngIf="selectedBoutique" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h5 class="modal-title mb-1">{{ selectedBoutique.nom }}</h5>
              <small class="text-muted">{{ selectedBoutique.categorie_principale || 'Categorie non renseignee' }}</small>
            </div>
            <span class="badge ms-2" [ngClass]="getStatutClass(selectedBoutique.statut)">{{ selectedBoutique.statut }}</span>
            <button type="button" class="btn-close" (click)="selectedBoutique = null"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <div class="detail-block">
                  <h6 class="detail-block-title">Informations boutique</h6>
                  <p class="mb-2"><strong>Plan:</strong> {{ selectedBoutique.plan || '-' }}</p>
                  <p class="mb-2"><strong>Email:</strong> {{ selectedBoutique.email_contact || '-' }}</p>
                  <p class="mb-2"><strong>Telephone:</strong> {{ selectedBoutique.telephone_contact || '-' }}</p>
                  <p class="mb-0"><strong>Description:</strong> {{ selectedBoutique.description_courte || '-' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-block">
                  <h6 class="detail-block-title">Proprietaire</h6>
                  <p class="mb-2"><strong>{{ selectedBoutique.utilisateur_id?.nom }} {{ selectedBoutique.utilisateur_id?.prenom }}</strong></p>
                  <p class="mb-2">{{ selectedBoutique.utilisateur_id?.email || '-' }}</p>
                  <p class="mb-0">{{ selectedBoutique.utilisateur_id?.telephone || '-' }}</p>
                </div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <div class="detail-block">
                  <h6 class="detail-block-title">Emplacement</h6>
                  <p class="mb-2"><strong>N°:</strong> {{ selectedBoutique.numero_emplacement || 'Non attribue' }}</p>
                  <p class="mb-2"><strong>Etage:</strong> {{ selectedBoutique.etage || '-' }}</p>
                  <p class="mb-2"><strong>Zone:</strong> {{ selectedBoutique.zone || '-' }}</p>
                  <p class="mb-0"><strong>Surface:</strong> {{ selectedBoutique.surface_m2 ? selectedBoutique.surface_m2 + ' m²' : '-' }}</p>
                </div>
              </div>
              <div class="col-md-6" *ngIf="boutiqueStats">
                <div class="detail-block">
                  <h6 class="detail-block-title">Statistiques</h6>
                  <div class="row g-2">
                    <div class="col-6">
                      <div class="detail-stat-box">
                        <small>Produits actifs</small>
                        <strong>{{ boutiqueStats.totalProduits }}</strong>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="detail-stat-box">
                        <small>Commandes</small>
                        <strong>{{ boutiqueStats.totalCommandes }}</strong>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="detail-stat-box">
                        <small>CA</small>
                        <strong>{{ boutiqueStats.chiffreAffaires | number:'1.0-0' }} Ar</strong>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="detail-stat-box">
                        <small>Avis</small>
                        <strong>{{ boutiqueStats.totalAvis }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="selectedBoutique.horaires && (selectedBoutique.horaires | json) !== '{}'" class="mb-3">
              <h6 class="detail-block-title mb-2">Horaires</h6>
              <pre class="bg-light p-2 rounded small mb-0">{{ selectedBoutique.horaires | json }}</pre>
            </div>
            <div class="pt-2 border-top">
              <small class="text-muted">
                Cree le {{ selectedBoutique.date_creation | date:'dd/MM/yyyy HH:mm' }}
                <span *ngIf="selectedBoutique.date_validation"> | Valide le {{ selectedBoutique.date_validation | date:'dd/MM/yyyy' }}</span>
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="selectedBoutique = null">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Emplacement -->
    <div *ngIf="editingEmplacement" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Emplacement - {{ editingEmplacement.nom }}</h5>
            <button type="button" class="btn-close" (click)="editingEmplacement = null"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Numero d'emplacement</label>
              <input type="text" class="form-control" [(ngModel)]="emplacementForm.numero_emplacement" placeholder="Ex: A12">
            </div>
            <div class="mb-3">
              <label class="form-label">Etage</label>
              <input type="text" class="form-control" [(ngModel)]="emplacementForm.etage" placeholder="Ex: RDC, 1er, 2eme">
            </div>
            <div class="mb-3">
              <label class="form-label">Zone</label>
              <input type="text" class="form-control" [(ngModel)]="emplacementForm.zone" placeholder="Ex: Zone A, Aile Nord">
            </div>
            <div class="mb-3">
              <label class="form-label">Surface (m²)</label>
              <input type="number" class="form-control" [(ngModel)]="emplacementForm.surface_m2" placeholder="Surface en m²">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="editingEmplacement = null">Annuler</button>
            <button class="btn btn-primary" (click)="saveEmplacement()">Enregistrer</button>
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
    .admin-filter-control:focus {
      border-color: #04a9f5;
      box-shadow: 0 0 0 0.2rem rgba(4, 169, 245, 0.15);
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
    .detail-block {
      border: 1px solid #edf1f7;
      background: #fbfcff;
      border-radius: 12px;
      padding: 12px;
      height: 100%;
    }
    .detail-block-title {
      margin-bottom: 10px;
      font-size: 0.9rem;
      color: #314255;
      font-weight: 700;
    }
    .detail-stat-box {
      border: 1px solid #e8edf5;
      border-radius: 10px;
      padding: 8px 10px;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .detail-stat-box small {
      color: #6d7b88;
      font-size: 0.72rem;
    }
    .detail-stat-box strong {
      color: #2d3e50;
      font-size: 0.88rem;
    }
  `]
})
export class AdminBoutiquesComponent implements OnInit {
  boutiques: any[] = [];
  filterStatut = '';
  search = '';
  loading = false;
  page = 1;
  pages = 1;
  total = 0;
  private searchTimer: any = null;
  countEnAttente = 0;
  selectedBoutique: any = null;
    private cdr = inject(ChangeDetectorRef);
  boutiqueStats: any = null;
  editingEmplacement: any = null;
  emplacementForm: any = { numero_emplacement: '', etage: '', zone: '', surface_m2: null };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadBoutiques(); }

  loadBoutiques(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.search) params.search = this.search;
    params.page = this.page;
    params.limit = 20;
    this.api.getBoutiques(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.boutiques = res.boutiques || [];
          this.total = res.total || this.boutiques.length;
          this.page = res.page || 1;
          this.pages = res.pages || 1;
          this.countEnAttente = this.boutiques.filter(b => b.statut === 'en_attente').length;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadBoutiques();
  }

  onSearchInput(): void {
    this.page = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadBoutiques(), 300);
  }

  goToPrevPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.loadBoutiques();
    }
  }

  goToNextPage(): void {
    if (this.page < this.pages) {
      this.page += 1;
      this.loadBoutiques();
    }
  }

  valider(id: string): void {
    this.api.validerBoutique(id).subscribe({ next: () => this.loadBoutiques() });
  }

  rejeter(id: string): void {
    if (confirm('Rejeter cette boutique ?')) {
      this.api.rejeterBoutique(id).subscribe({ next: () => this.loadBoutiques() });
    }
  }

  suspendre(id: string): void {
    this.api.suspendreBoutique(id).subscribe({ next: () => this.loadBoutiques() });
  }

  showDetail(b: any): void {
    this.api.getBoutiqueDetail(b._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedBoutique = res.boutique;
          this.boutiqueStats = res.stats;
        }
      },
      error: (err) => console.error(err)
    });
  }

  openEmplacement(b: any): void {
    this.editingEmplacement = b;
    this.emplacementForm = {
      numero_emplacement: b.numero_emplacement || '',
      etage: b.etage || '',
      zone: b.zone || '',
      surface_m2: b.surface_m2 || null
    };
  }

  saveEmplacement(): void {
    this.api.updateEmplacementBoutique(this.editingEmplacement._id, this.emplacementForm).subscribe({
      next: () => {
        this.editingEmplacement = null;
        this.loadBoutiques();
      }
    });
  }

  getStatutClass(statut: string): string {
    return { 'en_attente': 'bg-warning', 'active': 'bg-success', 'suspendue': 'bg-danger', 'validee': 'bg-info', 'fermee': 'bg-dark' }[statut] || 'bg-secondary';
  }
}
