import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-evenements',
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="row mb-3">
      <div class="col">
        <h5>Gestion des Evenements</h5>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="ti ti-plus me-1"></i> Nouvel Evenement
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <app-card>
      <div class="row mb-0">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatut" (change)="loadEvenements()">
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publie</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Termine</option>
            <option value="annule">Annule</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterType" (change)="loadEvenements()">
            <option value="">Tous les types</option>
            <option value="promotion">Promotion</option>
            <option value="animation">Animation</option>
            <option value="soldes">Soldes</option>
            <option value="ouverture">Ouverture</option>
            <option value="special">Special</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div class="col-md-3">
          <small class="text-muted pt-2 d-block">{{ total }} evenement(s)</small>
        </div>
      </div>
    </app-card>

    <!-- Liste des evenements -->
    <div class="row">
      <div class="col-md-6 col-xl-4" *ngFor="let evt of evenements">
        <app-card>
          <div class="d-flex align-items-start justify-content-between mb-2">
            <div>
              <span class="badge me-1" [ngClass]="getTypeClass(evt.type)">{{ evt.type }}</span>
              <span class="badge" [ngClass]="getStatutClass(evt.statut)">{{ evt.statut }}</span>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-link text-muted p-0" (click)="evt._showMenu = !evt._showMenu">
                <i class="ti ti-dots-vertical"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end" [class.show]="evt._showMenu" *ngIf="evt._showMenu">
                <a class="dropdown-item" href="javascript:void(0)" (click)="openEditModal(evt)"><i class="ti ti-edit me-2"></i>Modifier</a>
                <a *ngIf="evt.statut === 'brouillon'" class="dropdown-item" href="javascript:void(0)" (click)="changeStatut(evt._id, 'publie')"><i class="ti ti-send me-2"></i>Publier</a>
                <a *ngIf="evt.statut === 'publie'" class="dropdown-item" href="javascript:void(0)" (click)="changeStatut(evt._id, 'en_cours')"><i class="ti ti-play me-2"></i>Demarrer</a>
                <a *ngIf="evt.statut === 'en_cours'" class="dropdown-item" href="javascript:void(0)" (click)="changeStatut(evt._id, 'termine')"><i class="ti ti-check me-2"></i>Terminer</a>
                <a *ngIf="!['annule','termine'].includes(evt.statut)" class="dropdown-item text-warning" href="javascript:void(0)" (click)="changeStatut(evt._id, 'annule')"><i class="ti ti-x me-2"></i>Annuler</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" href="javascript:void(0)" (click)="supprimer(evt._id)"><i class="ti ti-trash me-2"></i>Supprimer</a>
              </div>
            </div>
          </div>

          <h5 class="mb-1">{{ evt.titre }}</h5>
          <p class="text-muted small mb-2" *ngIf="evt.description">{{ evt.description | slice:0:100 }}{{ evt.description.length > 100 ? '...' : '' }}</p>

          <div class="mb-2">
            <small class="text-muted d-block">
              <i class="ti ti-calendar me-1"></i>
              {{ evt.date_debut | date:'dd/MM/yyyy' }} - {{ evt.date_fin | date:'dd/MM/yyyy' }}
            </small>
            <small class="text-muted d-block" *ngIf="evt.lieu">
              <i class="ti ti-map-pin me-1"></i> {{ evt.lieu }}
            </small>
          </div>

          <div *ngIf="evt.boutiques_participantes?.length > 0" class="mb-2">
            <small class="text-muted">{{ evt.boutiques_participantes.length }} boutique(s) participante(s)</small>
            <div class="mt-1">
              <span *ngFor="let b of evt.boutiques_participantes | slice:0:3" class="badge bg-light text-dark me-1 mb-1">
                {{ $any(b).nom }}
              </span>
              <span *ngIf="evt.boutiques_participantes.length > 3" class="badge bg-light text-muted">
                +{{ evt.boutiques_participantes.length - 3 }} autres
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-between text-muted small mt-2 pt-2 border-top">
            <span>Cree le {{ evt.date_creation | date:'dd/MM/yy' }}</span>
            <span *ngIf="evt.capacite_max">Max: {{ evt.capacite_max }}</span>
          </div>
        </app-card>
      </div>
    </div>

    <div *ngIf="evenements.length === 0" class="text-center text-muted py-4">
      <i class="ti ti-calendar-off" style="font-size: 3rem;"></i>
      <p class="mt-2">Aucun evenement trouve</p>
    </div>

    <!-- Modal Creer/Modifier Evenement -->
    <div *ngIf="showModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingId ? 'Modifier' : 'Nouvel' }} Evenement</h5>
            <button type="button" class="btn-close" (click)="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-8 mb-3">
                <label class="form-label">Titre *</label>
                <input type="text" class="form-control" [(ngModel)]="form.titre" placeholder="Titre de l'evenement">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Type</label>
                <select class="form-select" [(ngModel)]="form.type">
                  <option value="promotion">Promotion</option>
                  <option value="animation">Animation</option>
                  <option value="soldes">Soldes</option>
                  <option value="ouverture">Ouverture</option>
                  <option value="special">Special</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" [(ngModel)]="form.description" rows="3" placeholder="Description de l'evenement"></textarea>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Date debut *</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="form.date_debut">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Date fin *</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="form.date_fin">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Lieu</label>
                <input type="text" class="form-control" [(ngModel)]="form.lieu" placeholder="Lieu">
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Capacite max</label>
                <input type="number" class="form-control" [(ngModel)]="form.capacite_max" placeholder="Illimite">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Statut</label>
                <select class="form-select" [(ngModel)]="form.statut">
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publie</option>
                  <option value="en_cours">En cours</option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Image URL</label>
                <input type="text" class="form-control" [(ngModel)]="form.image_url" placeholder="https://...">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Boutiques participantes</label>
              <div class="row">
                <div class="col-12 mb-2">
                  <div class="d-flex flex-wrap gap-1 mb-2" *ngIf="form.boutiques_participantes.length > 0">
                    <span *ngFor="let bid of form.boutiques_participantes" class="badge bg-primary">
                      {{ getBoutiqueName(bid) }}
                      <i class="ti ti-x ms-1" style="cursor:pointer" (click)="removeBoutique(bid)"></i>
                    </span>
                  </div>
                  <select class="form-select" (change)="addBoutique($event)">
                    <option value="">-- Ajouter une boutique --</option>
                    <option *ngFor="let b of boutiquesActives" [value]="b._id"
                      [disabled]="form.boutiques_participantes.includes(b._id)">
                      {{ b.nom }} ({{ b.categorie_principale }})
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal = false">Annuler</button>
            <button class="btn btn-primary" (click)="saveEvenement()" [disabled]="!form.titre || !form.date_debut || !form.date_fin">
              {{ editingId ? 'Mettre a jour' : 'Creer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminEvenementsComponent implements OnInit {
  evenements: any[] = [];
  boutiquesActives: any[] = [];
  filterStatut = '';
  filterType = '';
  total = 0;
  showModal = false;
  editingId: string | null = null;
  form: any = this.getEmptyForm();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEvenements();
    this.loadBoutiques();
  }

  getEmptyForm(): any {
    return {
      titre: '', description: '', type: 'promotion', date_debut: '', date_fin: '',
      image_url: '', boutiques_participantes: [], capacite_max: null, lieu: '', statut: 'brouillon'
    };
  }

  loadEvenements(): void {
    const params: any = {};
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.filterType) params.type = this.filterType;
    this.api.getEvenements(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.evenements = res.evenements.map((e: any) => ({ ...e, _showMenu: false }));
          this.total = res.total;
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadBoutiques(): void {
    this.api.getBoutiquesActives().subscribe({
      next: (res) => { if (res.success) this.boutiquesActives = res.boutiques; },
      error: (err) => console.error(err)
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.form = this.getEmptyForm();
    this.showModal = true;
  }

  openEditModal(evt: any): void {
    evt._showMenu = false;
    this.editingId = evt._id;
    this.form = {
      titre: evt.titre,
      description: evt.description || '',
      type: evt.type,
      date_debut: this.formatDateForInput(evt.date_debut),
      date_fin: this.formatDateForInput(evt.date_fin),
      image_url: evt.image_url || '',
      boutiques_participantes: (evt.boutiques_participantes || []).map((b: any) => b._id || b),
      capacite_max: evt.capacite_max,
      lieu: evt.lieu || '',
      statut: evt.statut
    };
    this.showModal = true;
  }

  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  }

  saveEvenement(): void {
    const data = { ...this.form };
    if (this.editingId) {
      this.api.updateEvenement(this.editingId, data).subscribe({
        next: () => { this.showModal = false; this.loadEvenements(); }
      });
    } else {
      this.api.createEvenement(data).subscribe({
        next: () => { this.showModal = false; this.loadEvenements(); }
      });
    }
  }

  changeStatut(id: string, statut: string): void {
    this.api.updateStatutEvenement(id, statut).subscribe({
      next: () => this.loadEvenements()
    });
  }

  supprimer(id: string): void {
    if (confirm('Supprimer cet evenement ?')) {
      this.api.deleteEvenement(id).subscribe({
        next: () => this.loadEvenements()
      });
    }
  }

  addBoutique(event: any): void {
    const id = event.target.value;
    if (id && !this.form.boutiques_participantes.includes(id)) {
      this.form.boutiques_participantes.push(id);
    }
    event.target.value = '';
  }

  removeBoutique(id: string): void {
    this.form.boutiques_participantes = this.form.boutiques_participantes.filter((b: string) => b !== id);
  }

  getBoutiqueName(id: string): string {
    const b = this.boutiquesActives.find(b => b._id === id);
    return b ? b.nom : id;
  }

  getTypeClass(type: string): string {
    const classes: any = {
      'promotion': 'bg-primary', 'animation': 'bg-info', 'soldes': 'bg-danger',
      'ouverture': 'bg-success', 'special': 'bg-warning', 'autre': 'bg-secondary'
    };
    return classes[type] || 'bg-secondary';
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'brouillon': 'bg-secondary', 'publie': 'bg-info', 'en_cours': 'bg-success',
      'termine': 'bg-dark', 'annule': 'bg-danger'
    };
    return classes[statut] || 'bg-secondary';
  }
}
