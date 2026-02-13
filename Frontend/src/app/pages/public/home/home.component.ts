import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="hero-section text-white text-center">
      <div class="hero-overlay"></div>
      <div class="container position-relative py-5">
        <h1 class="display-4 fw-bold mb-3">Bienvenue sur MallConnect</h1>
        <p class="lead mb-4">Votre centre commercial en ligne — Decouvrez les meilleures boutiques et produits d'Antananarivo</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/catalogue" class="btn btn-light btn-lg px-4">Explorer le catalogue</a>
          <a routerLink="/boutiques" class="btn btn-outline-light btn-lg px-4">Voir les boutiques</a>
        </div>
      </div>
    </section>

    <!-- Stats rapides -->
    <section class="py-4 bg-light">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-3 col-6 mb-3">
            <div class="h3 fw-bold text-primary mb-0">{{ stats.boutiques }}+</div>
            <small class="text-muted">Boutiques</small>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="h3 fw-bold text-primary mb-0">{{ stats.produits }}+</div>
            <small class="text-muted">Produits</small>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="h3 fw-bold text-primary mb-0">{{ stats.categories }}+</div>
            <small class="text-muted">Categories</small>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="h3 fw-bold text-primary mb-0">100%</div>
            <small class="text-muted">Securise</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Produits populaires -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="mb-0">Produits populaires</h3>
          <a routerLink="/catalogue" class="btn btn-outline-primary btn-sm">Voir tout</a>
        </div>
        <div class="row">
          <div class="col-6 col-md-4 col-lg-3 mb-4" *ngFor="let p of popularProduits">
            <div class="card h-100 product-card" [routerLink]="['/catalogue/produit', p._id]" style="cursor:pointer;">
              <img [src]="p.image_principale || 'assets/images/authentication/img-placeholder.svg'"
                   class="card-img-top" style="height:180px;object-fit:cover;" [alt]="p.nom" />
              <div class="card-body p-2">
                <p class="text-muted small mb-0" *ngIf="p.boutique_id?.nom">{{ p.boutique_id?.nom }}</p>
                <h6 class="card-title mb-1 text-truncate">{{ p.nom }}</h6>
                <div>
                  <span *ngIf="p.prix_promo" class="text-decoration-line-through text-muted small me-1">{{ p.prix_initial | number:'1.0-0' }} Ar</span>
                  <strong class="text-primary">{{ (p.prix_promo || p.prix_initial) | number:'1.0-0' }} Ar</strong>
                </div>
                <div class="mt-1" *ngIf="p.note_moyenne > 0">
                  <small class="text-warning">★ {{ p.note_moyenne | number:'1.1-1' }}</small>
                  <small class="text-muted"> ({{ p.nombre_avis }})</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="loading" class="text-center text-muted py-4">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <p class="d-inline">Chargement des produits...</p>
        </div>
        <div *ngIf="!loading && popularProduits.length === 0" class="text-center text-muted py-4">
          <p>Aucun produit disponible pour le moment.</p>
        </div>
        <div *ngIf="errorMsg" class="alert alert-danger text-center">
          <p class="mb-0">Erreur: {{ errorMsg }}</p>
          <p class="mb-0 small">Verifiez que le backend tourne sur http://localhost:3000</p>
        </div>
      </div>
    </section>

    <!-- Boutiques en vedette -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="mb-0">Boutiques en vedette</h3>
          <a routerLink="/boutiques" class="btn btn-outline-primary btn-sm">Voir toutes</a>
        </div>
        <div class="row">
          <div class="col-md-4 col-lg-3 mb-4" *ngFor="let b of featuredBoutiques">
            <div class="card h-100 text-center boutique-card" [routerLink]="['/boutiques', b._id]" style="cursor:pointer;">
              <div class="card-body">
                <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                     style="width:60px;height:60px;font-size:24px;">
                  {{ b.nom?.charAt(0)?.toUpperCase() }}
                </div>
                <h6 class="card-title">{{ b.nom }}</h6>
                <p class="text-muted small mb-2">{{ b.categorie_principale }}</p>
                <p class="small text-muted mb-2" *ngIf="b.description_courte">{{ b.description_courte | slice:0:80 }}...</p>
                <div *ngIf="b.note_moyenne > 0">
                  <span class="text-warning">★</span>
                  <small>{{ b.note_moyenne | number:'1.1-1' }}/5 ({{ b.nombre_avis }} avis)</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="featuredBoutiques.length === 0 && !loading" class="text-center text-muted py-4">
          <p>Aucune boutique disponible pour le moment.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-5 bg-primary text-white text-center" *ngIf="!isLoggedIn">
      <div class="container">
        <h3 class="mb-3">Rejoignez MallConnect aujourd'hui !</h3>
        <p class="mb-4">Creez votre compte pour profiter de toutes les fonctionnalites : panier, commandes, favoris et plus encore.</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/register" class="btn btn-light btn-lg">Creer mon compte</a>
          <a routerLink="/login" class="btn btn-outline-light btn-lg">Se connecter</a>
        </div>
      </div>
    </section>

    <!-- CTA Vendeur -->
    <section class="py-5 text-center">
      <div class="container">
        <h4 class="mb-3">Vous etes vendeur ?</h4>
        <p class="text-muted mb-4">Rejoignez notre centre commercial en ligne et touchez des milliers de clients.</p>
        <a routerLink="/register" class="btn btn-outline-primary btn-lg">Ouvrir ma boutique</a>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #4680ff 0%, #1d4ed8 50%, #1e3a8a 100%);
      position: relative;
      padding: 80px 0;
    }
    .hero-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,186.7C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
      background-size: cover;
    }
    .product-card {
      border: 1px solid #eee;
      transition: all 0.2s ease;
      &:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateY(-3px); }
    }
    .boutique-card {
      border: 1px solid #eee;
      transition: all 0.2s ease;
      &:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateY(-3px); }
    }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  popularProduits: any[] = [];
  featuredBoutiques: any[] = [];
  stats = { boutiques: 0, produits: 0, categories: 0 };
  loading = true;
  errorMsg = '';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  ngOnInit(): void {
    console.log('[HomeComponent] ngOnInit called');
    this.loadProduits();
    this.loadBoutiques();
  }

  loadProduits(): void {
    this.http.get<any>('http://localhost:3000/api/produits?limit=8&sort_by=populaire').subscribe({
      next: (res) => {
        console.log('[HomeComponent] Produits response:', res);
        this.loading = false;
        if (res && res.success) {
          this.popularProduits = res.produits || [];
          this.stats.produits = res.total || 0;
        } else {
          this.errorMsg = 'Reponse API sans succes';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[HomeComponent] Erreur chargement produits:', err);
        this.loading = false;
        this.errorMsg = err?.message || err?.error?.message || 'Erreur de connexion au serveur';
        this.cdr.detectChanges();
      }
    });
  }

  loadBoutiques(): void {
    this.http.get<any>('http://localhost:3000/api/boutiques').subscribe({
      next: (res) => {
        console.log('[HomeComponent] Boutiques response:', res);
        if (res && res.success) {
          this.featuredBoutiques = (res.boutiques || []).slice(0, 4);
          this.stats.boutiques = res.boutiques?.length || 0;
          const cats = new Set((res.boutiques || []).map((b: any) => b.categorie_principale).filter(Boolean));
          this.stats.categories = cats.size;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[HomeComponent] Erreur chargement boutiques:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
