import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-favoris',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favoris.component.html',
  styleUrls: ['./favoris.component.scss']
})
export class FavorisComponent implements OnInit {
  favoris: any[] = [];
  loading = true;
  filterType = '';
  removingIds: Set<string> = new Set();

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void { this.loadFavoris(); }

  loadFavoris(): void {
    this.loading = true;
    this.api.getMyFavoris().subscribe({
      next: (res) => {
        if (res.success) this.favoris = res.favoris;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get favorisFiltres(): any[] {
    if (!this.filterType) return this.favoris;
    return this.favoris.filter(f => f.type === this.filterType);
  }

  get stats() {
    const total = this.favoris.length;
    const produits = this.favoris.filter(f => f.type === 'produit').length;
    const boutiques = this.favoris.filter(f => f.type === 'boutique').length;
    return { total, produits, boutiques };
  }

  removeFavori(f: any): void {
    const id = f._id;
    this.removingIds.add(id);
    this.api.toggleFavori(f.type, f.produit_id?._id, f.boutique_id?._id).subscribe({
      next: () => {
        this.removingIds.delete(id);
        this.favoris = this.favoris.filter(fav => fav._id !== id);
      },
      error: () => {
        this.removingIds.delete(id);
      }
    });
  }

  isRemoving(id: string): boolean {
    return this.removingIds.has(id);
  }

  getDiscount(p: any): number {
    if (!p?.prix_promo || !p?.prix_initial || p.prix_promo >= p.prix_initial) return 0;
    return Math.round((1 - p.prix_promo / p.prix_initial) * 100);
  }

  addToCart(produitId: string): void {
    this.api.addToPanier(produitId, 1).subscribe({
      next: () => {},
      error: (err) => alert(err.error?.message || 'Erreur')
    });
  }

  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }
}
