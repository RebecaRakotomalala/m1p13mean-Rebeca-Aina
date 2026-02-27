import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  RiseOutline,
  FallOutline,
  AccountBookOutline,
  ShoppingCartOutline,
  PercentageOutline,
  SearchOutline,
  FilterOutline,
  ReloadOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  LineChartOutline,
  PieChartOutline,
  BarChartOutline,
  ContainerOutline,
  TrophyOutline,
  WarningOutline,
  InfoCircleOutline
} from '@ant-design/icons-angular/icons';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

interface ProduitBenefice {
  _id: string;
  nom: string;
  categorie: string;
  image: string;
  prix_vente: number;
  prix_achat: number;
  stock_quantite: number;
  nombre_ventes: number;
  total_vendu: number;
  chiffre_affaires: number;
  cout_total: number;
  benefice: number;
  marge_pct: number;
}

interface CategorieBenefice {
  categorie: string;
  chiffre_affaires: number;
  cout_total: number;
  benefice: number;
}

@Component({
  selector: 'app-boutique-benefice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, IconDirective, NgApexchartsModule],
  templateUrl: './boutique-benefice.component.html',
  styleUrls: ['./boutique-benefice.component.scss']
})
export class BoutiqueBeneficeComponent implements OnInit {
  private api = inject(ApiService);
  private notificationService = inject(NotificationService);
  private iconService = inject(IconService);

  constructor() {
    this.iconService.addIcon(
      RiseOutline,
      FallOutline,
      AccountBookOutline,
      ShoppingCartOutline,
      PercentageOutline,
      SearchOutline,
      FilterOutline,
      ReloadOutline,
      ArrowUpOutline,
      ArrowDownOutline,
      LineChartOutline,
      PieChartOutline,
      BarChartOutline,
      ContainerOutline,
      TrophyOutline,
      WarningOutline,
      InfoCircleOutline
    );
  }

  loading = true;

  // Stats globales
  totalCA = 0;
  totalCout = 0;
  totalBenefice = 0;
  margeMoyenne = 0;
  valeurStockAchat = 0;
  valeurStockVente = 0;
  beneficePotentielStock = 0;
  nbProduits = 0;
  nbProduitsAvecPrixAchat = 0;

  // Données
  produits: ProduitBenefice[] = [];
  produitsFiltres: ProduitBenefice[] = [];
  parCategorie: CategorieBenefice[] = [];
  beneficeParMois: { [key: string]: { ca: number; cout: number; benefice: number } } = {};

  // Filtres
  searchTerm = '';
  filterCategorie = '';
  sortBy = 'benefice'; // benefice, marge, ca, ventes
  categories: string[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Charts
  evolutionChartOptions!: Partial<ApexOptions>;
  categorieChartOptions!: Partial<ApexOptions>;
  topProduitsChartOptions!: Partial<ApexOptions>;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getBeneficeStats().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.stats) {
          const s = res.stats;
          this.totalCA = s.totalCA;
          this.totalCout = s.totalCout;
          this.totalBenefice = s.totalBenefice;
          this.margeMoyenne = s.margeMoyenne;
          this.valeurStockAchat = s.valeurStockAchat;
          this.valeurStockVente = s.valeurStockVente;
          this.beneficePotentielStock = s.beneficePotentielStock;
          this.nbProduits = s.nbProduits;
          this.nbProduitsAvecPrixAchat = s.nbProduitsAvecPrixAchat;

          this.produits = res.produits || [];
          this.parCategorie = res.parCategorie || [];
          this.beneficeParMois = res.beneficeParMois || {};

          this.extractCategories();
          this.applyFilters();
          this.initCharts();
        } else {
          this.notificationService.warning(res.message || 'Aucune donnée disponible');
        }
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Erreur chargement bénéfices');
      }
    });
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.produits.forEach(p => { if (p.categorie) cats.add(p.categorie); });
    this.categories = Array.from(cats).sort();
  }

  applyFilters(): void {
    let filtered = [...this.produits];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.nom?.toLowerCase().includes(term));
    }

    if (this.filterCategorie) {
      filtered = filtered.filter(p => p.categorie === this.filterCategorie);
    }

    // Tri
    switch (this.sortBy) {
      case 'benefice':
        filtered.sort((a, b) => b.benefice - a.benefice);
        break;
      case 'marge':
        filtered.sort((a, b) => b.marge_pct - a.marge_pct);
        break;
      case 'ca':
        filtered.sort((a, b) => b.chiffre_affaires - a.chiffre_affaires);
        break;
      case 'ventes':
        filtered.sort((a, b) => b.total_vendu - a.total_vendu);
        break;
    }

    this.produitsFiltres = filtered;
    this.currentPage = 1;
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.produitsFiltres.length / this.pageSize);
  }

  get paginatedProduits(): ProduitBenefice[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.produitsFiltres.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const p: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) p.push(i);
    } else {
      p.push(1);
      if (current > 3) p.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) p.push(i);
      if (current < total - 2) p.push(-1);
      p.push(total);
    }
    return p;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  getBeneficeClass(benefice: number): string {
    if (benefice > 0) return 'text-success';
    if (benefice < 0) return 'text-danger';
    return 'text-muted';
  }

  getMargeClass(marge: number): string {
    if (marge >= 40) return 'badge-success';
    if (marge >= 20) return 'badge-info';
    if (marge >= 0) return 'badge-warning';
    return 'badge-danger';
  }

  getMargeBarWidth(marge: number): number {
    return Math.min(100, Math.max(0, marge));
  }

  getMargeBarColor(marge: number): string {
    if (marge >= 40) return 'bg-success';
    if (marge >= 20) return 'bg-info';
    if (marge >= 0) return 'bg-warning';
    return 'bg-danger';
  }

  initCharts(): void {
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const moisCourant = new Date().getMonth();

    // Évolution bénéfice par mois
    const labels: string[] = [];
    const caData: number[] = [];
    const coutData: number[] = [];
    const beneficeData: number[] = [];

    for (let i = 0; i < 6; i++) {
      const moisIndex = (moisCourant - 5 + i + 12) % 12;
      const annee = new Date().getFullYear();
      const moisKey = `${annee}-${String(moisIndex + 1).padStart(2, '0')}`;
      labels.push(moisNoms[moisIndex]);

      const found = this.beneficeParMois[moisKey];
      caData.push(found?.ca || 0);
      coutData.push(found?.cout || 0);
      beneficeData.push(found?.benefice || 0);
    }

    this.evolutionChartOptions = {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 800 }
      },
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: '55%', dataLabels: { position: 'top' } }
      },
      colors: ['#1677ff', '#ff4d4f', '#52c41a'],
      series: [
        { name: 'Chiffre d\'affaires', data: caData },
        { name: 'Coût d\'achat', data: coutData },
        { name: 'Bénéfice', data: beneficeData }
      ],
      xaxis: {
        categories: labels,
        labels: { style: { colors: '#8c8c8c' } }
      },
      yaxis: {
        labels: {
          style: { colors: '#8c8c8c' },
          formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`
        }
      },
      grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => `${val.toLocaleString()} Ar` }
      },
      legend: { position: 'top' }
    };

    // Bénéfice par catégorie (donut)
    if (this.parCategorie.length > 0) {
      const catAvecBenefice = this.parCategorie.filter(c => c.benefice > 0);
      this.categorieChartOptions = {
        chart: {
          type: 'donut',
          height: 320,
          background: 'transparent',
          animations: { enabled: true, speed: 800 }
        },
        series: catAvecBenefice.map(c => Math.round(c.benefice)),
        labels: catAvecBenefice.map(c => c.categorie),
        colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96'],
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Bénéfice total',
                  formatter: () => `${this.totalBenefice.toLocaleString()} Ar`
                }
              }
            }
          }
        },
        legend: { position: 'bottom' },
        tooltip: {
          y: { formatter: (val: number) => `${val.toLocaleString()} Ar` }
        }
      };
    }

    // Top produits (horizontal bar)
    const top10 = this.produits.filter(p => p.benefice > 0).slice(0, 10);
    if (top10.length > 0) {
      this.topProduitsChartOptions = {
        chart: {
          type: 'bar',
          height: 350,
          toolbar: { show: false },
          background: 'transparent',
          animations: { enabled: true, speed: 800 }
        },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 6, barHeight: '60%' }
        },
        colors: ['#52c41a'],
        series: [{ name: 'Bénéfice', data: top10.map(p => Math.round(p.benefice)) }],
        xaxis: {
          categories: top10.map(p => p.nom.length > 25 ? p.nom.substring(0, 25) + '...' : p.nom)
        },
        dataLabels: { enabled: true, formatter: (val: number) => `${val.toLocaleString()} Ar` },
        grid: { borderColor: '#f0f0f0' },
        tooltip: {
          theme: 'light',
          y: { formatter: (val: number) => `${val.toLocaleString()} Ar` }
        }
      };
    }
  }
}

