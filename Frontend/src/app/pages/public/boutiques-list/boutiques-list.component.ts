import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
})
export class BoutiquesListComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  boutiques: Boutique[] = [];
  filteredBoutiques: Boutique[] = [];
  search = '';
  loading = true;
  selectedCategorie = '';
  categories: string[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'nom' | 'note' | 'recent' = 'nom';

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/api/boutiques').subscribe({
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
}
