import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayout } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { PublicLayoutComponent } from './theme/layouts/public-layout/public-layout.component';
import { authGuard, adminGuard, boutiqueGuard, clientGuard } from './guards/auth.guard';

const routes: Routes = [
  // === PAGES PUBLIQUES (accessibles sans connexion) ===
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/public/home/home.component').then(c => c.HomeComponent)
      },
      {
        path: 'catalogue',
        loadComponent: () => import('./pages/public/catalogue/public-catalogue.component').then(c => c.PublicCatalogueComponent)
      },
      {
        path: 'catalogue/produit/:id',
        loadComponent: () => import('./pages/public/produit-detail/public-produit-detail.component').then(c => c.PublicProduitDetailComponent)
      },
      {
        path: 'boutiques',
        loadComponent: () => import('./pages/public/boutiques-list/boutiques-list.component').then(c => c.BoutiquesListComponent)
      },
      {
        path: 'boutiques/:id',
        loadComponent: () => import('./pages/public/boutique-detail/boutique-detail.component').then(c => c.BoutiqueDetailComponent)
      }
    ]
  },
  // === AUTH ROUTES (GUEST LAYOUT) ===
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then(c => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/auth-register/auth-register.component').then(c => c.AuthRegisterComponent)
      }
    ]
  },
  // === ADMIN ROUTES ===
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
      },
      {
        path: 'boutiques',
        loadComponent: () => import('./pages/admin/boutiques/admin-boutiques.component').then(c => c.AdminBoutiquesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/admin-users.component').then(c => c.AdminUsersComponent)
      }
    ]
  },
  // === BOUTIQUE ROUTES ===
  {
    path: 'boutique',
    component: AdminLayout,
    canActivate: [boutiqueGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/boutique/dashboard/boutique-dashboard.component').then(c => c.BoutiqueDashboardComponent)
      },
      {
        path: 'produits',
        loadComponent: () => import('./pages/boutique/produits/boutique-produits.component').then(c => c.BoutiqueProduitsComponent)
      },
      {
        path: 'commandes',
        loadComponent: () => import('./pages/boutique/commandes/boutique-commandes.component').then(c => c.BoutiqueCommandesComponent)
      },
      {
        path: 'myspace',
        loadComponent: () => import('./pages/boutique/myspace/myspace.component').then(c => c.MySpaceComponent)
      },
      {
        path: 'historique',
        loadComponent: () => import('./pages/boutique/historique/boutique-historique.component').then(c => c.BoutiqueHistoriqueComponent)
      },
      {
        path: 'stock',
        loadComponent: () => import('./pages/boutique/stock/boutique-stock.component').then(c => c.BoutiqueStockComponent)
      },
      {
        path: 'benefice',
        loadComponent: () => import('./pages/boutique/benefice/boutique-benefice.component').then(c => c.BoutiqueBeneficeComponent)
      }
    ]
  },
  // === CLIENT ROUTES (authentifie) ===
  {
    path: 'client',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'panier', pathMatch: 'full' },
      {
        path: 'panier',
        loadComponent: () => import('./pages/client/panier/panier.component').then(c => c.PanierComponent)
      },
      {
        path: 'commandes',
        loadComponent: () => import('./pages/client/commandes/client-commandes.component').then(c => c.ClientCommandesComponent)
      },
      {
        path: 'favoris',
        loadComponent: () => import('./pages/client/favoris/favoris.component').then(c => c.FavorisComponent)
      }
    ]
  },
  // === FALLBACK ===
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
