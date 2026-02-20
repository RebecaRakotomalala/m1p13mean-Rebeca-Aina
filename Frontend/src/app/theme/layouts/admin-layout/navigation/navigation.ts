export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
  roles?: string[];
}

// Navigation pour ADMIN
export const AdminNavigationItems: NavigationItem[] = [
  {
    id: 'admin-group',
    title: 'Administration',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'admin-dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/dashboard',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'admin-boutiques',
        title: 'Boutiques',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/boutiques',
        icon: 'shop'
      },
      {
        id: 'admin-users',
        title: 'Utilisateurs',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/users',
        icon: 'team'
      }
    ]
  }
];

// Navigation pour BOUTIQUE
export const BoutiqueNavigationItems: NavigationItem[] = [
  {
    id: 'boutique-group',
    title: 'Ma Boutique',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'boutique-dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/dashboard',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'boutique-produits',
        title: 'Mes Produits',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/produits',
        icon: 'appstore'
      },
      {
        id: 'boutique-commandes',
        title: 'Commandes',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/commandes',
        icon: 'shopping-cart'
      },
      {
        id: 'boutique-historique',
        title: 'Historiques',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/historique',
        icon: 'history'
      },
      {
        id: 'boutique-stock',
        title: 'Stock',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/stock',
        icon: 'container'
      },
      {
        id: 'boutique-benefice',
        title: 'Bénéfice',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/benefice',
        icon: 'rise'
      }
    ]
  },

  {
    id: 'myspace',
    title: 'MySpace',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'myspace-home',
        title: 'MySpace',
        type: 'item',
        classes: 'nav-item',
        url: '/boutique/myspace',
        icon: 'user'
      }
    ]
  }
];

// Navigation pour CLIENT
export const ClientNavigationItems: NavigationItem[] = [
  {
    id: 'client-home-group',
    title: '',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'client-home',
        title: 'Accueil',
        type: 'item',
        classes: 'nav-item',
        url: '/',
        icon: 'home'
      }
    ]
  },
  {
    id: 'client-group',
    title: 'Mon Espace',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'client-catalogue',
        title: 'Catalogue',
        type: 'item',
        classes: 'nav-item',
        url: '/catalogue',
        icon: 'appstore'
      },
      {
        id: 'client-panier',
        title: 'Mon Panier',
        type: 'item',
        classes: 'nav-item',
        url: '/client/panier',
        icon: 'shopping-cart'
      },
      {
        id: 'client-commandes',
        title: 'Mes Commandes',
        type: 'item',
        classes: 'nav-item',
        url: '/client/commandes',
        icon: 'file-done'
      },
      {
        id: 'client-favoris',
        title: 'Mes Favoris',
        type: 'item',
        classes: 'nav-item',
        url: '/client/favoris',
        icon: 'heart'
      }
    ]
  }
];

// Fallback (compatibilite)
export const NavigationItems: NavigationItem[] = ClientNavigationItems;
