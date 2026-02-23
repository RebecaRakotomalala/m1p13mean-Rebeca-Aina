import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-public-produit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './public-produit-detail.component.html',
  styleUrls: ['./public-produit-detail.component.scss'],
})
export class PublicProduitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  private apiUrl = 'http://localhost:3000/api';

  produit: any = null;
  avis: any[] = [];
  quantite = 1;
  isFavori = false;
  newAvis = { note: 5, commentaire: '' };
  loading = true;
  addingToCart = false;
  cartAdded = false;
  selectedImage = '';
  submittingAvis = false;

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn;
  }

  get allImages(): string[] {
    const imgs: string[] = [];
    if (this.produit?.image_principale) imgs.push(this.produit.image_principale);
    if (this.produit?.images_secondaires) {
      this.produit.images_secondaires.forEach((img: string) => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs;
  }

  get discount(): number {
    if (!this.produit?.prix_promo || !this.produit?.prix_initial || this.produit.prix_promo >= this.produit.prix_initial) return 0;
    return Math.round((1 - this.produit.prix_promo / this.produit.prix_initial) * 100);
  }

  get prixFinal(): number {
    return this.produit?.prix_promo || this.produit?.prix_initial || 0;
  }

  get isOutOfStock(): boolean {
    return !this.produit?.stock_illimite && this.produit?.stock_quantite < 1;
  }

  get averageRating(): number {
    if (this.avis.length === 0) return this.produit?.note_moyenne || 0;
    return this.avis.reduce((sum: number, a: any) => sum + a.note, 0) / this.avis.length;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${this.apiUrl}/produits/${id}`).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.produit = res.produit;
            this.selectedImage = this.produit.image_principale || '';
          }
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
      this.http.get<any>(`${this.apiUrl}/avis/produit/${id}`).subscribe({
        next: (res) => { if (res.success) this.avis = res.avis; this.cdr.detectChanges(); },
        error: () => {}
      });
      if (this.isLoggedIn) {
        this.http.get<any>(`${this.apiUrl}/favoris/check/produit/${id}`).subscribe({
          next: (res) => { this.isFavori = res.isFavori; this.cdr.detectChanges(); },
          error: () => {}
        });
      }
    } else {
      this.loading = false;
    }
  }

  selectImage(img: string): void {
    this.selectedImage = img;
  }

  increaseQty(): void {
    if (!this.produit?.stock_illimite && this.quantite >= this.produit?.stock_quantite) return;
    this.quantite++;
  }

  decreaseQty(): void {
    if (this.quantite > 1) this.quantite--;
  }

  addToCart(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.addingToCart = true;
    this.http.post<any>(`${this.apiUrl}/panier/add`, { produit_id: this.produit._id, quantite: this.quantite }).subscribe({
      next: () => {
        this.addingToCart = false;
        this.cartAdded = true;
        setTimeout(() => { this.cartAdded = false; this.cdr.detectChanges(); }, 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addingToCart = false;
        alert(err.error?.message || 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }

  toggleFavori(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.http.post<any>(`${this.apiUrl}/favoris/toggle`, { type: 'produit', produit_id: this.produit._id }).subscribe({
      next: (res) => { this.isFavori = res.isFavori; this.cdr.detectChanges(); }
    });
  }

  submitAvis(): void {
    if (!this.newAvis.commentaire.trim()) return;
    this.submittingAvis = true;
    this.http.post<any>(`${this.apiUrl}/avis`, {
      type: 'produit',
      produit_id: this.produit._id,
      note: this.newAvis.note,
      commentaire: this.newAvis.commentaire
    }).subscribe({
      next: () => {
        this.submittingAvis = false;
        this.newAvis = { note: 5, commentaire: '' };
        this.http.get<any>(`${this.apiUrl}/avis/produit/${this.produit._id}`).subscribe({
          next: (res) => { if (res.success) this.avis = res.avis; this.cdr.detectChanges(); }
        });
      },
      error: (err) => {
        this.submittingAvis = false;
        alert(err.error?.message || 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }

  getStarsArray(n: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(n) ? 1 : 0);
  }

  getRelativeDate(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine(s)`;
    if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
    return `Il y a ${Math.floor(days / 365)} an(s)`;
  }
}
