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
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'gestion',
    title: 'Gestion',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'utilisateurs',
        title: 'Utilisateurs',
        type: 'item',
        classes: 'nav-item',
        url: '/utilisateurs',
        icon: 'user',
        breadcrumbs: false
      },
      {
        id: 'boutiques',
        title: 'Boutiques',
        type: 'item',
        classes: 'nav-item',
        url: '/boutiques',
        icon: 'shop',
        breadcrumbs: false
      },
      {
        id: 'produits',
        title: 'Produits',
        type: 'item',
        classes: 'nav-item',
        url: '/produits',
        icon: 'inbox',
        breadcrumbs: false
      },
      {
        id: 'commandes',
        title: 'Commandes',
        type: 'item',
        classes: 'nav-item',
        url: '/commandes',
        icon: 'shopping-cart',
        breadcrumbs: false
      },
      {
        id: 'retours',
        title: 'Retours & Remboursements',
        type: 'item',
        classes: 'nav-item',
        url: '/retours',
        icon: 'swap',
        breadcrumbs: false
      },
      {
        id: 'factures',
        title: 'Factures',
        type: 'item',
        classes: 'nav-item',
        url: '/factures',
        icon: 'file-text',
        breadcrumbs: false
      },
      {
        id: 'stocks',
        title: 'Alertes Stock',
        type: 'item',
        classes: 'nav-item',
        url: '/stocks',
        icon: 'warning',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'moderation',
    title: 'Modération',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'avis',
        title: 'Avis & Commentaires',
        type: 'item',
        classes: 'nav-item',
        url: '/avis',
        icon: 'star',
        breadcrumbs: false
      },
      {
        id: 'messages',
        title: 'Messages',
        type: 'item',
        classes: 'nav-item',
        url: '/messages',
        icon: 'message',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing & Promotions',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'codes-promo',
        title: 'Codes Promo',
        type: 'item',
        classes: 'nav-item',
        url: '/codes-promo',
        icon: 'gift',
        breadcrumbs: false
      },
      {
        id: 'evenements',
        title: 'Événements',
        type: 'item',
        classes: 'nav-item',
        url: '/evenements',
        icon: 'calendar',
        breadcrumbs: false
      },
      {
        id: 'notifications',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'notification',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'fidelite',
    title: 'Programme Fidélité',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'configuration-fidelite',
        title: 'Configuration',
        type: 'item',
        classes: 'nav-item',
        url: '/fidelite',
        icon: 'setting',
        breadcrumbs: false
      },
      {
        id: 'recompenses',
        title: 'Récompenses',
        type: 'item',
        classes: 'nav-item',
        url: '/fidelite/recompenses',
        icon: 'gift',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'localisation',
    title: 'Localisation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'zones',
        title: 'Zones & Étages',
        type: 'item',
        classes: 'nav-item',
        url: '/zones',
        icon: 'environment',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'configuration',
    title: 'Configuration',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'parametres',
        title: 'Paramètres Système',
        type: 'item',
        classes: 'nav-item',
        url: '/parametres',
        icon: 'setting',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Rapports',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'statistiques',
        title: 'Statistiques',
        type: 'item',
        classes: 'nav-item',
        url: '/analytics',
        icon: 'bar-chart',
        breadcrumbs: false
      },
      {
        id: 'rapports',
        title: 'Rapports',
        type: 'item',
        classes: 'nav-item',
        url: '/analytics/rapports',
        icon: 'file-pdf',
        breadcrumbs: false
      },
      {
        id: 'logs',
        title: 'Logs Système',
        type: 'item',
        classes: 'nav-item',
        url: '/logs',
        icon: 'file-text',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'login',
        title: 'Login',
        type: 'item',
        classes: 'nav-item',
        url: '/login',
        icon: 'login',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Register',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'profile',
        target: true,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'utilities',
    title: 'UI Components',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'typography',
        title: 'Typography',
        type: 'item',
        classes: 'nav-item',
        url: '/typography',
        icon: 'font-size'
      },
      {
        id: 'color',
        title: 'Colors',
        type: 'item',
        classes: 'nav-item',
        url: '/color',
        icon: 'bg-colors'
      },
      {
        id: 'ant-icons',
        title: 'Ant Icons',
        type: 'item',
        classes: 'nav-item',
        url: 'https://ant.design/components/icon',
        icon: 'ant-design',
        target: true,
        external: true
      }
    ]
  },

  {
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'chrome'
      },
      {
        id: 'document',
        title: 'Document',
        type: 'item',
        classes: 'nav-item',
        url: 'https://codedthemes.gitbook.io/mantis-angular/',
        icon: 'question',
        target: true,
        external: true
      }
    ]
  }
];
