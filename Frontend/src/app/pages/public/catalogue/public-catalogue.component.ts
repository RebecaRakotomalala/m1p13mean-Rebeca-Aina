import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-public-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './public-catalogue.component.html',
  styleUrls: ['./public-catalogue.component.scss'],
})
export class PublicCatalogueComponent implements OnInit {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private router = inject(Router);

  produits: any[] = [];
  search = '';
  sortBy = '';
  minPrix: number | null = null;
  maxPrix: number | null = null;
  currentPage = 1;
  totalPages = 1;
  totalProduits = 0;
  loading = true;
  viewMode: 'grid' | 'list' = 'grid';
  selectedCategorie = '';
  categories: string[] = [];
  showFilters = false;
  cartAnimation: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.loadCategories();
    this.loadProduits();
  }

  loadCategories(): void {
    // Load all products briefly to extract categories
    this.http.get<any>('http://localhost:3000/api/produits?limit=500').subscribe({
      next: (res) => {
        if (res.success && res.produits) {
          const cats = new Set<string>();
          res.produits.forEach((p: any) => { if (p.categorie) cats.add(p.categorie); });
          this.categories = Array.from(cats).sort();
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadProduits(): void {
    this.loading = true;
    let url = `http://localhost:3000/api/produits?page=${this.currentPage}&limit=12`;
    if (this.search) url += `&search=${encodeURIComponent(this.search)}`;
    if (this.sortBy) url += `&sort_by=${this.sortBy}`;
    if (this.minPrix) url += `&min_prix=${this.minPrix}`;
    if (this.maxPrix) url += `&max_prix=${this.maxPrix}`;
    if (this.selectedCategorie) url += `&categorie=${encodeURIComponent(this.selectedCategorie)}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.produits = res.produits;
          this.totalPages = res.pages || 1;
          this.totalProduits = res.total || 0;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(produitId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartAnimation[produitId] = true;
    this.api.addToPanier(produitId, 1).subscribe({
      next: (res) => {
        setTimeout(() => { this.cartAnimation[produitId] = false; this.cdr.detectChanges(); }, 1200);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cartAnimation[produitId] = false;
        alert(err.error?.message || 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProduits();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) { pages.push(1); if (start > 2) pages.push(-1); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < this.totalPages) { if (end < this.totalPages - 1) pages.push(-1); pages.push(this.totalPages); }
    return pages;
  }

  getDiscount(p: any): number {
    if (!p.prix_promo || !p.prix_initial || p.prix_promo >= p.prix_initial) return 0;
    return Math.round((1 - p.prix_promo / p.prix_initial) * 100);
  }

  onCategoryClick(cat: string): void {
    this.selectedCategorie = cat;
    this.currentPage = 1;
    this.loadProduits();
  }

  clearAllFilters(): void {
    this.search = '';
    this.selectedCategorie = '';
    this.sortBy = '';
    this.minPrix = null;
    this.maxPrix = null;
    this.currentPage = 1;
    this.loadProduits();
  }

  get hasActiveFilters(): boolean {
    return !!(this.search || this.selectedCategorie || this.sortBy || this.minPrix || this.maxPrix);
  }
}
