import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-boutiques',
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <app-card cardTitle="Gestion des Boutiques">
      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatut" (change)="loadBoutiques()">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="active">Active</option>
            <option value="suspendue">Suspendue</option>
            <option value="fermee">Fermee</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" placeholder="Rechercher..." [(ngModel)]="search" (input)="loadBoutiques()" />
        </div>
        <div class="col-md-3 ms-auto text-end">
          <span class="badge bg-warning me-1" *ngIf="countEnAttente > 0">{{ countEnAttente }} en attente</span>
          <span class="text-muted small">{{ boutiques.length }} boutique(s)</span>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Categorie</th>
              <th>Proprietaire</th>
              <th>Emplacement</th>
              <th>Statut</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
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
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-sm btn-outline-info" (click)="showDetail(b)" title="Detail">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button *ngIf="b.statut === 'en_attente'" class="btn btn-sm btn-success" (click)="valider(b._id)" title="Valider">
                    <i class="ti ti-check"></i>
                  </button>
                  <button *ngIf="b.statut === 'en_attente'" class="btn btn-sm btn-danger" (click)="rejeter(b._id)" title="Rejeter">
                    <i class="ti ti-x"></i>
                  </button>
                  <button *ngIf="b.statut === 'active'" class="btn btn-sm btn-warning" (click)="suspendre(b._id)" title="Suspendre">
                    <i class="ti ti-ban"></i>
                  </button>
                  <button *ngIf="b.statut === 'suspendue'" class="btn btn-sm btn-success" (click)="valider(b._id)" title="Reactiver">
                    <i class="ti ti-check"></i>
                  </button>
                  <button *ngIf="b.statut === 'active'" class="btn btn-sm btn-outline-primary" (click)="openEmplacement(b)" title="Emplacement">
                    <i class="ti ti-map-pin"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="boutiques.length === 0" class="text-center text-muted py-4">Aucune boutique trouvee</div>
      </div>
    </app-card>

    <!-- Modal Detail Boutique -->
    <div *ngIf="selectedBoutique" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedBoutique.nom }}</h5>
            <button type="button" class="btn-close" (click)="selectedBoutique = null"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Informations</h6>
                <p class="mb-1"><strong>Categorie:</strong> {{ selectedBoutique.categorie_principale }}</p>
                <p class="mb-1"><strong>Statut:</strong> <span class="badge" [ngClass]="getStatutClass(selectedBoutique.statut)">{{ selectedBoutique.statut }}</span></p>
                <p class="mb-1"><strong>Plan:</strong> {{ selectedBoutique.plan }}</p>
                <p class="mb-1"><strong>Email:</strong> {{ selectedBoutique.email_contact || '-' }}</p>
                <p class="mb-1"><strong>Telephone:</strong> {{ selectedBoutique.telephone_contact || '-' }}</p>
                <p class="mb-0" *ngIf="selectedBoutique.description_courte"><strong>Description:</strong> {{ selectedBoutique.description_courte }}</p>
              </div>
              <div class="col-md-6">
                <h6>Proprietaire</h6>
                <p class="mb-1"><strong>{{ selectedBoutique.utilisateur_id?.nom }} {{ selectedBoutique.utilisateur_id?.prenom }}</strong></p>
                <p class="mb-1">{{ selectedBoutique.utilisateur_id?.email }}</p>
                <p class="mb-0">{{ selectedBoutique.utilisateur_id?.telephone || '-' }}</p>
              </div>
            </div>
            <hr>
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Emplacement</h6>
                <p class="mb-1"><strong>N°:</strong> {{ selectedBoutique.numero_emplacement || 'Non attribue' }}</p>
                <p class="mb-1"><strong>Etage:</strong> {{ selectedBoutique.etage || '-' }}</p>
                <p class="mb-1"><strong>Zone:</strong> {{ selectedBoutique.zone || '-' }}</p>
                <p class="mb-0"><strong>Surface:</strong> {{ selectedBoutique.surface_m2 ? selectedBoutique.surface_m2 + ' m²' : '-' }}</p>
              </div>
              <div class="col-md-6" *ngIf="boutiqueStats">
                <h6>Statistiques</h6>
                <p class="mb-1"><strong>Produits actifs:</strong> {{ boutiqueStats.totalProduits }}</p>
                <p class="mb-1"><strong>Commandes:</strong> {{ boutiqueStats.totalCommandes }}</p>
                <p class="mb-1"><strong>CA:</strong> {{ boutiqueStats.chiffreAffaires | number:'1.0-0' }} Ar</p>
                <p class="mb-0"><strong>Avis:</strong> {{ boutiqueStats.totalAvis }}</p>
              </div>
            </div>
            <div *ngIf="selectedBoutique.horaires && (selectedBoutique.horaires | json) !== '{}'" class="mb-3">
              <h6>Horaires</h6>
              <pre class="bg-light p-2 rounded small">{{ selectedBoutique.horaires | json }}</pre>
            </div>
            <div class="mb-3">
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
  `
})
export class AdminBoutiquesComponent implements OnInit {
  boutiques: any[] = [];
  filterStatut = '';
  search = '';
  countEnAttente = 0;
  selectedBoutique: any = null;
  boutiqueStats: any = null;
  editingEmplacement: any = null;
  emplacementForm: any = { numero_emplacement: '', etage: '', zone: '', surface_m2: null };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadBoutiques(); }

  loadBoutiques(): void {
    const params: any = {};
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.search) params.search = this.search;
    this.api.getBoutiques(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.boutiques = res.boutiques;
          this.countEnAttente = this.boutiques.filter(b => b.statut === 'en_attente').length;
        }
      },
      error: (err) => console.error(err)
    });
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
