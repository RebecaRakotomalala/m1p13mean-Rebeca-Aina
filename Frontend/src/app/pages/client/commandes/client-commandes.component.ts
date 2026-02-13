import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-client-commandes',
  imports: [CommonModule, CardComponent],
  template: `
    <app-card cardTitle="Mes Commandes">
      <div *ngFor="let cmd of commandes" class="border rounded p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>{{ cmd.numero_commande }}</strong>
            <span class="badge ms-2" [ngClass]="getStatutClass(cmd.statut)">{{ cmd.statut }}</span>
          </div>
          <div class="text-end">
            <strong class="text-primary">{{ cmd.montant_total | number:'1.0-0' }} Ar</strong>
            <br><small class="text-muted">{{ cmd.date_creation | date:'dd/MM/yyyy HH:mm' }}</small>
          </div>
        </div>
        <div *ngFor="let l of cmd.lignes" class="d-flex align-items-center py-1 border-top">
          <img [src]="l.image_produit || 'assets/images/authentication/img-placeholder.svg'" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" class="me-2" />
          <div class="flex-grow-1">
            <span>{{ l.nom_produit }}</span>
            <small class="text-muted ms-1">x{{ l.quantite }}</small>
          </div>
          <span>{{ l.prix_total | number:'1.0-0' }} Ar</span>
        </div>
        <div class="mt-2 text-muted small">
          Mode: {{ cmd.mode_livraison || 'N/A' }} | Paiement: {{ cmd.statut_paiement }}
        </div>
      </div>
      <div *ngIf="commandes.length === 0" class="text-center text-muted py-5">
        <h5>Aucune commande</h5>
        <p>Vous n'avez pas encore passe de commande.</p>
      </div>
    </app-card>
  `
})
export class ClientCommandesComponent implements OnInit {
  commandes: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getMyCommandes().subscribe({
      next: (res) => { if (res.success) this.commandes = res.commandes; },
      error: (err) => console.error(err)
    });
  }

  getStatutClass(statut: string): string {
    const c: any = { 'en_attente': 'bg-warning', 'confirmee': 'bg-info', 'en_preparation': 'bg-primary', 'prete': 'bg-success', 'livree': 'bg-success', 'annulee': 'bg-danger' };
    return c[statut] || 'bg-secondary';
  }
}
