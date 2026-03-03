import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-panier',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadPanier(); }

  loadPanier(): void {
    this.loadingCart = true;
    this.api.getPanier().subscribe({
      next: (res) => {
        if (res.success) this.panier = res.panier;
        this.loadingCart = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loadingCart = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateQty(ligneId: string, qty: number): void {
    if (qty < 1) return;
    const item = this.panier?.items?.find((i: any) => i?._id === ligneId);
    if (!item) return;
    const previousQty = item.quantite;
    this.updatingItems.add(ligneId);
    item.quantite = qty;
    item.sous_total = qty * (item.prix_unitaire || 0);
    this.recalculatePanierTotals();
    this.cdr.markForCheck();
    this.api.updatePanierItem(ligneId, qty).subscribe({
      next: () => {
        this.updatingItems.delete(ligneId);
        this.cdr.markForCheck();
      },
      error: () => {
        item.quantite = previousQty;
        item.sous_total = previousQty * (item.prix_unitaire || 0);
        this.recalculatePanierTotals();
        this.updatingItems.delete(ligneId);
        this.cdr.markForCheck();
      }
    });
  }

  removeItem(ligneId: string): void {
    const currentItems = this.panier?.items || [];
    const index = currentItems.findIndex((i: any) => i?._id === ligneId);
    if (index < 0) return;
    const removedItem = currentItems[index];
    this.updatingItems.add(ligneId);
    currentItems.splice(index, 1);
    this.recalculatePanierTotals();
    this.cdr.markForCheck();
    this.api.removePanierItem(ligneId).subscribe({
      next: () => {
        this.updatingItems.delete(ligneId);
        this.cdr.markForCheck();
      },
      error: () => {
        currentItems.splice(index, 0, removedItem);
        this.recalculatePanierTotals();
        this.updatingItems.delete(ligneId);
        this.cdr.markForCheck();
      }
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
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Erreur lors de la commande');
        this.cdr.markForCheck();
      }
    });
  }

  goToCommandes(): void {
    this.router.navigate(['/client/commandes']);
  }

  continueShopping(): void {
    this.router.navigate(['/catalogue']);
  }

  trackByCartItem(index: number, item: any): string {
    return item?._id || item?.produit?._id || `${index}`;
  }

  private recalculatePanierTotals(): void {
    if (!this.panier) return;
    const items = this.panier.items || [];
    this.panier.nombre_items = items.reduce((sum: number, i: any) => sum + (i.quantite || 0), 0);
    this.panier.total = items.reduce((sum: number, i: any) => sum + (i.sous_total || 0), 0);
  }
}
