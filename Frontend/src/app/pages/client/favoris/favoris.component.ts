import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-favoris',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favoris.component.html',
  styleUrls: ['./favoris.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavorisComponent implements OnInit {
  favoris: any[] = [];
  favorisFiltres: any[] = [];
  loading = true;
  filterType = '';
  removingIds: Set<string> = new Set();
  readonly stats = { total: 0, produits: 0, boutiques: 0 };

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadFavoris(); }

  loadFavoris(): void {
    this.loading = true;
    this.api.getMyFavoris().subscribe({
      next: (res) => {
        if (res.success) this.favoris = res.favoris || [];
        this.computeStats();
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyFilter(): void {
    this.favorisFiltres = this.filterType ? this.favoris.filter(f => f.type === this.filterType) : this.favoris;
    this.cdr.markForCheck();
  }

  private computeStats(): void {
    this.stats.total = this.favoris.length;
    this.stats.produits = this.favoris.filter(f => f.type === 'produit').length;
    this.stats.boutiques = this.favoris.filter(f => f.type === 'boutique').length;
  }

  removeFavori(f: any): void {
    const id = f._id;
    this.removingIds.add(id);
    this.api.toggleFavori(f.type, f.produit_id?._id, f.boutique_id?._id).subscribe({
      next: () => {
        this.removingIds.delete(id);
        this.favoris = this.favoris.filter(fav => fav._id !== id);
        this.computeStats();
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => {
        this.removingIds.delete(id);
        this.cdr.markForCheck();
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

  trackByFavori(index: number, favori: any): string {
    return favori?._id || `${favori?.type || 'item'}-${favori?.produit_id?._id || favori?.boutique_id?._id || index}`;
  }

  setFilterType(type: string): void {
    this.filterType = type;
    this.applyFilter();
  }
}
