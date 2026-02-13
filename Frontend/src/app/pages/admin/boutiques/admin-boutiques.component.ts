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
        <div class="col-md-4">
          <select class="form-select" [(ngModel)]="filterStatut" (change)="loadBoutiques()">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="active">Active</option>
            <option value="suspendue">Suspendue</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" placeholder="Rechercher..." [(ngModel)]="search" (input)="loadBoutiques()" />
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Categorie</th>
              <th>Proprietaire</th>
              <th>Statut</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of boutiques">
              <td><strong>{{ b.nom }}</strong></td>
              <td>{{ b.categorie_principale }}</td>
              <td>{{ b.utilisateur_id?.nom }} {{ b.utilisateur_id?.prenom }}</td>
              <td><span class="badge" [ngClass]="getStatutClass(b.statut)">{{ b.statut }}</span></td>
              <td>{{ b.note_moyenne | number:'1.1-1' }}/5</td>
              <td>
                <button *ngIf="b.statut === 'en_attente'" class="btn btn-sm btn-success me-1" (click)="valider(b._id)">Valider</button>
                <button *ngIf="b.statut === 'active'" class="btn btn-sm btn-warning me-1" (click)="suspendre(b._id)">Suspendre</button>
                <button *ngIf="b.statut === 'suspendue'" class="btn btn-sm btn-success me-1" (click)="valider(b._id)">Reactiver</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="boutiques.length === 0" class="text-center text-muted py-4">Aucune boutique trouvee</div>
      </div>
    </app-card>
  `
})
export class AdminBoutiquesComponent implements OnInit {
  boutiques: any[] = [];
  filterStatut = '';
  search = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadBoutiques(); }

  loadBoutiques(): void {
    const params: any = {};
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.search) params.search = this.search;
    this.api.getBoutiques(params).subscribe({
      next: (res) => { if (res.success) this.boutiques = res.boutiques; },
      error: (err) => console.error(err)
    });
  }

  valider(id: string): void {
    this.api.validerBoutique(id).subscribe({ next: () => this.loadBoutiques() });
  }

  suspendre(id: string): void {
    this.api.suspendreBoutique(id).subscribe({ next: () => this.loadBoutiques() });
  }

  getStatutClass(statut: string): string {
    return { 'en_attente': 'bg-warning', 'active': 'bg-success', 'suspendue': 'bg-danger', 'validee': 'bg-info' }[statut] || 'bg-secondary';
  }
}
