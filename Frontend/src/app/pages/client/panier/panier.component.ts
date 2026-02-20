import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-panier',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit {
  panier: any = null;
  modeLivraison = 'retrait_boutique';
  adresse = '';
  loading = false;
  loadingCart = true;
  updatingItems: Set<string> = new Set();
  orderSuccess = false;
  orderNumber = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void { this.loadPanier(); }

  loadPanier(): void {
    this.loadingCart = true;
    this.api.getPanier().subscribe({
      next: (res) => {
        if (res.success) this.panier = res.panier;
        this.loadingCart = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingCart = false;
      }
    });
  }

  updateQty(ligneId: string, qty: number): void {
    if (qty < 1) return;
    this.updatingItems.add(ligneId);
    this.api.updatePanierItem(ligneId, qty).subscribe({
      next: () => {
        this.updatingItems.delete(ligneId);
        this.loadPanier();
      },
      error: () => this.updatingItems.delete(ligneId)
    });
  }

  removeItem(ligneId: string): void {
    this.updatingItems.add(ligneId);
    this.api.removePanierItem(ligneId).subscribe({
      next: () => {
        this.updatingItems.delete(ligneId);
        this.loadPanier();
      },
      error: () => this.updatingItems.delete(ligneId)
    });
  }

  isUpdating(id: string): boolean {
    return this.updatingItems.has(id);
  }

  get fraisLivraison(): number {
    return this.modeLivraison === 'livraison_domicile' ? 5000 : 0;
  }

  get totalFinal(): number {
    return (this.panier?.total || 0) + this.fraisLivraison;
  }

  commander(): void {
    this.loading = true;
    const data: any = {
      mode_livraison: this.modeLivraison,
      methode_paiement: 'especes'
    };
    if (this.modeLivraison === 'livraison_domicile' && this.adresse) {
      data.adresse_livraison = { rue: this.adresse, ville: 'Antananarivo', pays: 'Madagascar' };
    }
    this.api.createCommande(data).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.orderSuccess = true;
          this.orderNumber = res.commande.numero_commande;
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Erreur lors de la commande');
      }
    });
  }

  goToCommandes(): void {
    this.router.navigate(['/client/commandes']);
  }

  continueShopping(): void {
    this.router.navigate(['/catalogue']);
  }
}
