import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './boutique-detail.component.html',
  styleUrls: ['./boutique-detail.component.scss']
})
export class BoutiqueDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  boutique: any = null;
  produits: any[] = [];
  filteredProduits: any[] = [];
  loading = true;
  produitsLoading = true;
  search = '';
  selectedCategorie = '';
  categories: string[] = [];
  sortBy: 'nom' | 'prix_asc' | 'prix_desc' | 'populaire' = 'nom';
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`http://localhost:3000/api/boutiques/${id}`).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) this.boutique = res.boutique;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
      this.http.get<any>(`http://localhost:3000/api/produits/boutique/${id}`).subscribe({
        next: (res) => {
          this.produitsLoading = false;
          if (res.success) {
            this.produits = (res.produits || []).filter((p: any) => p.actif);
            this.extractCategories();
            this.applyFilters();
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.produitsLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
      this.produitsLoading = false;
    }
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.produits.forEach(p => { if (p.categorie) cats.add(p.categorie); });
    this.categories = Array.from(cats).sort();
  }

  applyFilters(): void {
    const s = this.search.toLowerCase().trim();
    let result = this.produits;

    if (s) {
      result = result.filter(p =>
        p.nom?.toLowerCase().includes(s) ||
        p.categorie?.toLowerCase().includes(s)
      );
    }

    if (this.selectedCategorie) {
      result = result.filter(p => p.categorie === this.selectedCategorie);
    }

    // Sort
    switch (this.sortBy) {
      case 'prix_asc':
        result = [...result].sort((a, b) => (a.prix_promo || a.prix_initial) - (b.prix_promo || b.prix_initial));
        break;
      case 'prix_desc':
        result = [...result].sort((a, b) => (b.prix_promo || b.prix_initial) - (a.prix_promo || a.prix_initial));
        break;
      case 'populaire':
        result = [...result].sort((a, b) => (b.nombre_ventes || 0) - (a.nombre_ventes || 0));
        break;
      default:
        result = [...result].sort((a, b) => a.nom.localeCompare(b.nom));
    }

    this.filteredProduits = result;
  }

  getInitials(nom: string): string {
    if (!nom) return '?';
    const words = nom.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return nom.charAt(0).toUpperCase();
  }

  getGradient(nom: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < nom.length; i++) {
      hash = nom.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  }

  getStars(note: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(note) ? 1 : 0);
  }

  getDiscount(p: any): number {
    if (!p.prix_promo || !p.prix_initial || p.prix_promo >= p.prix_initial) return 0;
    return Math.round((1 - p.prix_promo / p.prix_initial) * 100);
  }

  get totalValue(): number {
    return this.produits.reduce((sum, p) => sum + (p.prix_promo || p.prix_initial || 0), 0);
  }

  get avgPrice(): number {
    if (this.produits.length === 0) return 0;
    return this.totalValue / this.produits.length;
  }

  clearFilters(): void {
    this.search = '';
    this.selectedCategorie = '';
    this.sortBy = 'nom';
    this.applyFilters();
  }
}
