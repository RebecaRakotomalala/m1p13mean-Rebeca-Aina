import { Component, OnInit, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  InboxOutline,
  AccountBookOutline,
  ClockCircleOutline,
  StarOutline,
  EyeOutline,
  ShopOutline,
  AppstoreOutline,
  CheckCircleOutline,
  MessageOutline,
  ExclamationCircleOutline,
  ReloadOutline,
  PlusOutline
} from '@ant-design/icons-angular/icons';
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, IconDirective, NgApexchartsModule],
  templateUrl: './boutique-dashboard.component.html',
  styleUrls: ['./boutique-dashboard.component.scss']
})
export class BoutiqueDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private notificationService = inject(NotificationService);
  private iconService = inject(IconService);

  // Charts
  salesChart = viewChild<ChartComponent>('salesChart');
  categoriesChart = viewChild<ChartComponent>('categoriesChart');
  ordersChart = viewChild<ChartComponent>('ordersChart');
  
  salesChartOptions!: Partial<ApexOptions>;
  categoriesChartOptions!: Partial<ApexOptions>;
  ordersChartOptions!: Partial<ApexOptions>;

  stats: {
    totalProduits?: number;
    totalVentes?: number;
    commandesCount?: number;
    commandesEnAttente?: number;
    totalAvis?: number;
    ventesParMois?: Array<{ _id: string; total: number; count: number }> | number[];
    categories?: Array<{ nom: string; count: number }>;
    commandesParStatut?: Array<{ statut: string; count: number }>;
    boutiques?: Array<{
      nom: string;
      categorie_principale?: string;
      statut?: string;
      note_moyenne?: number;
      nombre_vues?: number;
    }>;
  } | null = null;
  loading = true;
  error: string | null = null;

  constructor() {
    // Enregistrer les icônes nécessaires
    this.iconService.addIcon(
      InboxOutline,
      AccountBookOutline,
      ClockCircleOutline,
      StarOutline,
      EyeOutline,
      ShopOutline,
      AppstoreOutline,
      CheckCircleOutline,
      MessageOutline,
      ExclamationCircleOutline,
      ReloadOutline,
      PlusOutline
    );
  }

  ngOnInit(): void {
    this.initCharts();
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.api.getBoutiqueStats().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.stats = res.stats;
          // Réinitialiser les graphiques avec les nouvelles données
          setTimeout(() => {
            this.initCharts();
          }, 100);
        } else {
          this.error = res.message || 'Erreur lors du chargement des statistiques';
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || err.message || 'Erreur lors du chargement des statistiques';
        this.error = errorMessage;
        this.notificationService.error(errorMessage);
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  initCharts(): void {
    // S'assurer que les options sont toujours définies
    if (!this.salesChartOptions) {
      this.salesChartOptions = {};
    }
    if (!this.categoriesChartOptions) {
      this.categoriesChartOptions = {};
    }
    if (!this.ordersChartOptions) {
      this.ordersChartOptions = {};
    }

    // Graphique des ventes (ligne)
    let ventesData: number[] = [];
    let categoriesMois: string[] = [];
    
    if (this.stats?.ventesParMois && Array.isArray(this.stats.ventesParMois) && this.stats.ventesParMois.length > 0) {
      if (typeof this.stats.ventesParMois[0] === 'object' && this.stats.ventesParMois[0] !== null && '_id' in this.stats.ventesParMois[0]) {
        const ventesObj = this.stats.ventesParMois as Array<{ _id: string; total: number; count: number }>;
        
        const moisMap = new Map<string, number>();
        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const moisCourant = new Date().getMonth();
        
        for (let i = 0; i < 6; i++) {
          const moisIndex = (moisCourant - 5 + i + 12) % 12;
          const moisKey = moisNoms[moisIndex];
          moisMap.set(moisKey, 0);
        }
        
        ventesObj.forEach(v => {
          try {
            const [, month] = v._id.split('-');
            const moisIndex = parseInt(month) - 1; // 0-11
            if (moisIndex >= 0 && moisIndex < 12) {
              const moisKey = moisNoms[moisIndex];
              moisMap.set(moisKey, (moisMap.get(moisKey) || 0) + (v.total || 0));
            }
          } catch (e) {
            console.warn('Erreur parsing date:', v._id, e);
          }
        });
        
        categoriesMois = Array.from(moisMap.keys());
        ventesData = Array.from(moisMap.values());
      } else {
        ventesData = this.stats.ventesParMois as number[];
        categoriesMois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      }
    } else {
      ventesData = this.generateDefaultSalesData();
      categoriesMois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    }
    
    this.salesChartOptions = {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
        animations: {
          enabled: true,
          speed: 800
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#1677ff'],
      series: [
        {
          name: 'Ventes (Ar)',
          data: ventesData
        }
      ],
      xaxis: {
        categories: categoriesMois,
        labels: {
          style: { colors: '#8c8c8c' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#8c8c8c' },
          formatter: (val: number) => `${(val / 1000).toFixed(0)}k Ar`
        }
      },
      grid: {
        borderColor: '#f5f5f5',
        strokeDashArray: 0
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val: number) => `${val.toLocaleString()} Ar`
        }
      }
    };

    // Graphique des catégories (donut)
    const categoriesData = this.stats?.categories || [];
    const defaultCategories = categoriesData.length > 0 
      ? categoriesData 
      : [{ nom: 'Aucune catégorie', count: 1 }];
    
    this.categoriesChartOptions = {
      chart: {
        type: 'donut',
        height: 350,
        animations: {
          enabled: true,
          speed: 800
        }
      },
      labels: defaultCategories.map(c => c.nom),
      series: defaultCategories.map(c => c.count),
      colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => `${this.stats?.totalProduits || 0} produits`
              }
            }
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} produits`
        }
      }
    };

    // Graphique des commandes par statut (barre)
    // Calculer depuis les données disponibles si non fourni par l'API
    let ordersData = this.stats?.commandesParStatut || [];
    
    // Si pas de données, créer des données par défaut basées sur les stats disponibles
    if (ordersData.length === 0) {
      ordersData = [
        { statut: 'en_attente', count: this.stats?.commandesEnAttente || 0 },
        { statut: 'confirmee', count: Math.max(0, (this.stats?.commandesCount || 0) - (this.stats?.commandesEnAttente || 0)) },
        { statut: 'livree', count: Math.floor((this.stats?.commandesCount || 0) * 0.6) } // Estimation
      ];
    }
    
    this.ordersChartOptions = {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
        animations: {
          enabled: true,
          speed: 800
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8,
          distributed: false
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toString()
      },
      colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'],
      series: [
        {
          name: 'Commandes',
          data: ordersData.map(o => o.count)
        }
      ],
      xaxis: {
        categories: ordersData.map(o => this.formatOrderStatus(o.statut))
      },
      yaxis: {
        labels: {
          style: { colors: '#8c8c8c' }
        }
      },
      grid: {
        borderColor: '#f5f5f5'
      },
      tooltip: {
        theme: 'light'
      }
    };
  }

  private generateDefaultSalesData(): number[] {
    // Générer des données par défaut si non disponibles
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 500000) + 100000);
  }

  private formatOrderStatus(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En traitement',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[statut.toLowerCase()] || statut;
  }
}
