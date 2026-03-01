import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-avis',
  imports: [CommonModule, FormsModule, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card cardTitle="Moderation des Avis">
      <!-- Filtres -->
      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterSignale" (change)="loadAvis()">
            <option value="">Tous les avis</option>
            <option value="true">Signales uniquement</option>
            <option value="false">Non signales</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterApprouve" (change)="loadAvis()">
            <option value="">Tous</option>
            <option value="true">Approuves</option>
            <option value="false">Rejetes</option>
          </select>
        </div>
        <div class="col-md-3">
          <small class="text-muted pt-2 d-block">{{ total }} avis - Page {{ page }}/{{ pages }}</small>
        </div>
        <div class="col-md-3 text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" [disabled]="loading || page <= 1" (click)="page = page - 1; loadAvis()">
            <i class="ti ti-chevron-left"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page >= pages" (click)="page = page + 1; loadAvis()">
            <i class="ti ti-chevron-right"></i>
          </button>
        </div>
      </div>
      <div *ngIf="loading" class="text-center text-muted py-3">Chargement des avis...</div>

      <!-- Liste des avis -->
      <div *ngFor="let avis of avisList" class="card mb-3" [ngClass]="{'border-warning': avis.signale, 'border-danger': !avis.approuve}">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <div class="d-flex align-items-center mb-2">
                <!-- Etoiles -->
                <span *ngFor="let star of [1,2,3,4,5]" class="me-1">
                  <i class="ti" [ngClass]="star <= avis.note ? 'ti-star-filled text-warning' : 'ti-star text-muted'"></i>
                </span>
                <span class="ms-2 badge" [ngClass]="avis.type === 'produit' ? 'bg-light-primary' : 'bg-light-success'">
                  {{ avis.type }}
                </span>
                <span *ngIf="avis.signale" class="ms-2 badge bg-warning">
                  <i class="ti ti-alert-triangle me-1"></i> Signale ({{ avis.nombre_signalements }})
                </span>
                <span *ngIf="!avis.approuve" class="ms-2 badge bg-danger">Rejete</span>
              </div>

              <h6 *ngIf="avis.titre" class="mb-1">{{ avis.titre }}</h6>
              <p class="mb-2">{{ avis.commentaire || 'Pas de commentaire' }}</p>

              <small class="text-muted">
                Par <strong>{{ avis.client_id?.nom }} {{ avis.client_id?.prenom }}</strong>
                ({{ avis.client_id?.email }})
                - {{ avis.date_creation | date:'dd/MM/yyyy HH:mm' }}
              </small>
              <br>
              <small class="text-muted" *ngIf="avis.type === 'produit' && avis.produit_id">
                Produit: <strong>{{ avis.produit_id.nom }}</strong>
              </small>
              <small class="text-muted" *ngIf="avis.type === 'boutique' && avis.boutique_id">
                Boutique: <strong>{{ avis.boutique_id.nom }}</strong>
              </small>

              <div *ngIf="avis.reponse_boutique" class="mt-2 p-2 bg-light rounded">
                <small class="text-muted"><i class="ti ti-message me-1"></i> Reponse boutique:</small>
                <p class="mb-0 small">{{ avis.reponse_boutique }}</p>
              </div>

              <!-- Raison de moderation -->
              <div *ngIf="avis.raison_moderation" class="mt-2 p-2 bg-light-danger rounded">
                <small class="text-danger"><i class="ti ti-shield me-1"></i> Raison moderation: {{ avis.raison_moderation }}</small>
              </div>
            </div>

            <div class="col-md-4 text-end">
              <div class="btn-group-vertical">
                <button *ngIf="!avis.approuve" class="btn btn-sm btn-success mb-1" (click)="moderer(avis._id, true)">
                  <i class="ti ti-check me-1"></i> Approuver
                </button>
                <button *ngIf="avis.approuve" class="btn btn-sm btn-warning mb-1" (click)="openRejectModal(avis)">
                  <i class="ti ti-x me-1"></i> Rejeter
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="supprimer(avis._id)">
                  <i class="ti ti-trash me-1"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="avisList.length === 0" class="text-center text-muted py-4">Aucun avis trouve</div>
    </app-card>

    <!-- Modal Rejet -->
    <div *ngIf="rejectingAvis" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rejeter l'avis</h5>
            <button type="button" class="btn-close" (click)="rejectingAvis = null"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Raison du rejet</label>
              <textarea class="form-control" [(ngModel)]="raisonRejet" rows="3" placeholder="Indiquez la raison du rejet..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="rejectingAvis = null">Annuler</button>
            <button class="btn btn-warning" (click)="confirmReject()">Rejeter</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminAvisComponent implements OnInit {
  avisList: any[] = [];
  filterSignale = '';
  filterApprouve = '';
  loading = false;
  page = 1;
  pages = 1;
  total = 0;
  rejectingAvis: any = null;
  raisonRejet = '';

  // manual detector for OnPush
  private cdr = inject(ChangeDetectorRef);

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadAvis(); }

  loadAvis(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: 15 };
    if (this.filterSignale) params.signale = this.filterSignale;
    if (this.filterApprouve) params.approuve = this.filterApprouve;
    this.api.getAdminAvis(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.avisList = res.avis;
          this.total = res.total;
          this.pages = res.pages;
          this.page = res.page;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  moderer(id: string, approuve: boolean): void {
    this.api.modererAvis(id, approuve).subscribe({
      next: () => this.loadAvis()
    });
  }

  openRejectModal(avis: any): void {
    this.rejectingAvis = avis;
    this.raisonRejet = '';
  }

  confirmReject(): void {
    if (this.rejectingAvis) {
      this.api.modererAvis(this.rejectingAvis._id, false, this.raisonRejet).subscribe({
        next: () => { this.rejectingAvis = null; this.loadAvis(); }
      });
    }
  }

  supprimer(id: string): void {
    if (confirm('Supprimer definitivement cet avis ?')) {
      this.api.supprimerAvis(id).subscribe({
        next: () => this.loadAvis()
      });
    }
  }
}
