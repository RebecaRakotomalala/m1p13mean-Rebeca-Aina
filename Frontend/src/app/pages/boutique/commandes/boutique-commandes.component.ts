import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-boutique-commandes',
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <app-card cardTitle="Commandes de ma boutique">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr><th>N* Commande</th><th>Client</th><th>Produits</th><th>Total</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let cmd of commandes">
              <td><strong>{{ cmd.numero_commande }}</strong></td>
              <td>{{ cmd.client_nom }}</td>
              <td>
                <div *ngFor="let l of cmd.lignes">
                  {{ l.nom_produit }} x{{ l.quantite }}
                </div>
              </td>
              <td>{{ cmd.montant_total | number:'1.0-0' }} Ar</td>
              <td><span class="badge" [ngClass]="getStatutClass(cmd.statut)">{{ cmd.statut }}</span></td>
              <td>{{ cmd.date_creation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <select class="form-select form-select-sm" style="width:auto;display:inline-block;" [ngModel]="cmd.statut" (ngModelChange)="updateStatut(cmd._id, $event)">
                  <option value="en_attente">En attente</option>
                  <option value="confirmee">Confirmee</option>
                  <option value="en_preparation">En preparation</option>
                  <option value="prete">Prete</option>
                  <option value="livree">Livree</option>
                  <option value="annulee">Annulee</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="commandes.length === 0" class="text-center text-muted py-4">Aucune commande</div>
      </div>
    </app-card>
  `
})
export class BoutiqueCommandesComponent implements OnInit {
  commandes: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadCommandes(); }

  loadCommandes(): void {
    this.api.getCommandesBoutique().subscribe({
      next: (res) => { if (res.success) this.commandes = res.commandes; },
      error: (err) => console.error(err)
    });
  }

  updateStatut(id: string, statut: string): void {
    this.api.updateStatutCommande(id, statut).subscribe({ next: () => this.loadCommandes() });
  }

  getStatutClass(statut: string): string {
    const c: any = { 'en_attente': 'bg-warning', 'confirmee': 'bg-info', 'en_preparation': 'bg-primary', 'prete': 'bg-success', 'livree': 'bg-success', 'annulee': 'bg-danger' };
    return c[statut] || 'bg-secondary';
  }
}
