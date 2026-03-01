import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface Boutique {
  _id: string;
  nom: string;
  slug: string;
  description_courte?: string;
  logo_url?: string;
  banniere_url?: string;
  categorie_principale: string;
  categories_secondaires?: string[];
  note_moyenne: number;
  nombre_avis: number;
  nombre_vues: number;
  statut: string;
  services?: string[];
  date_creation: string;
}

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './boutiques-list.component.html',
  styleUrls: ['./boutiques-list.component.scss']
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoutiquesListComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = environment.apiUrl;

  boutiques: Boutique[] = [];
  filteredBoutiques: Boutique[] = [];
  search = '';
  loading = true;
  selectedCategorie = '';
  categories: string[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'nom' | 'note' | 'recent' = 'nom';
  favorisIds: Set<string> = new Set();
  favAnimation: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.http.get<any>(`${this.apiUrl}/boutiques`).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.boutiques = (res.boutiques || []).filter((b: any) => b.statut === 'active');
          this.extractCategories();
          this.applyFilters();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[BoutiquesList] Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.loadFavoris();
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.boutiques.forEach(b => {
      if (b.categorie_principale) cats.add(b.categorie_principale);
    });
    this.categories = Array.from(cats).sort();
  }

  applyFilters(): void {
    const s = this.search.toLowerCase().trim();
    let result = this.boutiques;

    // Text search
    if (s) {
      result = result.filter(b =>
        b.nom?.toLowerCase().includes(s) ||
        b.categorie_principale?.toLowerCase().includes(s) ||
        b.description_courte?.toLowerCase().includes(s)
      );
    }

    // Category filter
    if (this.selectedCategorie) {
      result = result.filter(b => b.categorie_principale === this.selectedCategorie);
    }

    // Sort
    if (this.sortBy === 'note') {
      result = [...result].sort((a, b) => b.note_moyenne - a.note_moyenne);
    } else if (this.sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
    } else {
      result = [...result].sort((a, b) => a.nom.localeCompare(b.nom));
    }

    this.filteredBoutiques = result;
  }

  getInitials(nom: string): string {
    if (!nom) return '?';
    const words = nom.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return nom.charAt(0).toUpperCase();
  }

  getAvatarGradient(nom: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
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

  clearFilters(): void {
    this.search = '';
    this.selectedCategorie = '';
    this.sortBy = 'nom';
    this.applyFilters();
  }

  // ----- favoris logic -----
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loadFavoris(): void {
    if (!this.auth.isLoggedIn) return;
    this.api.getMyFavoris('boutique').subscribe({
      next: (res) => {
        if (res.success && res.favoris) {
          this.favorisIds = new Set(
            res.favoris
              .map((f: any) => f.boutique_id?._id || f.boutique_id)
              .filter(Boolean)
          );
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  isFavori(boutiqueId: string): boolean {
    return this.favorisIds.has(boutiqueId);
  }

  toggleFavori(boutiqueId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.favAnimation[boutiqueId] = true;
    this.api.toggleFavori('boutique', undefined, boutiqueId).subscribe({
      next: (res) => {
        if (this.favorisIds.has(boutiqueId)) {
          this.favorisIds.delete(boutiqueId);
        } else {
          this.favorisIds.add(boutiqueId);
        }
        setTimeout(() => {
          this.favAnimation[boutiqueId] = false;
          this.cdr.detectChanges();
        }, 600);
        this.cdr.detectChanges();
      },
      error: () => {
        this.favAnimation[boutiqueId] = false;
        this.cdr.detectChanges();
      }
    });
  }
}
