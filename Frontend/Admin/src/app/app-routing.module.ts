// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminLayout } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard/default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      // Utilisateurs
      {
        path: 'utilisateurs',
        loadComponent: () => import('./pages/utilisateurs/liste/liste-utilisateurs.component').then((c) => c.ListeUtilisateursComponent)
      },
      // Boutiques
      {
        path: 'boutiques',
        loadComponent: () => import('./pages/boutiques/liste/liste-boutiques.component').then((c) => c.ListeBoutiquesComponent)
      },
      // Commandes
      {
        path: 'commandes',
        loadComponent: () => import('./pages/commandes/liste/liste-commandes.component').then((c) => c.ListeCommandesComponent)
      },
      // Paramètres
      {
        path: 'parametres',
        loadComponent: () => import('./pages/parametres/parametres.component').then((c) => c.ParametresComponent)
      },
      // Produits (placeholder - à créer)
      {
        path: 'produits',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Avis (placeholder - à créer)
      {
        path: 'avis',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Messages (placeholder - à créer)
      {
        path: 'messages',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Codes Promo (placeholder - à créer)
      {
        path: 'codes-promo',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Fidélité (placeholder - à créer)
      {
        path: 'fidelite',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'fidelite/recompenses',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Événements (placeholder - à créer)
      {
        path: 'evenements',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Notifications (placeholder - à créer)
      {
        path: 'notifications',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Retours (placeholder - à créer)
      {
        path: 'retours',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Factures (placeholder - à créer)
      {
        path: 'factures',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Stocks (placeholder - à créer)
      {
        path: 'stocks',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Zones (placeholder - à créer)
      {
        path: 'zones',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Analytics (placeholder - à créer)
      {
        path: 'analytics',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'analytics/rapports',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Logs (placeholder - à créer)
      {
        path: 'logs',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      // Pages demo (à garder pour référence)
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'test-connection',
        loadComponent: () => import('./demo/pages/test-connection/test-connection.component').then((c) => c.TestConnectionComponent)
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
