import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, NgApexchartsModule],
  template: `
    <div class="admin-dashboard-theme">
    <app-card cardTitle="Pilotage du centre commercial MallCConnect" cardClass="dashboard-hero-card" headerClass="dashboard-hero-header">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h5 class="mb-1">Dashboard Statistique Admin</h5>
          <p class="text-muted mb-0">Les filtres s'appliquent aux KPIs commerciaux et aux graphes commandes/ventes. La repartition par categorie reste globale.</p>
        </div>
        <span class="badge dashboard-filter-badge">{{ getActiveFilterLabel() }}</span>
      </div>
      <hr class="my-3">
      <div class="row g-2">
        <div class="col-md-2">
          <label class="form-label mb-1">Periode</label>
          <select class="form-select" [(ngModel)]="filters.period" (change)="onPeriodChange()">
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
            <option value="12m">12 mois</option>
            <option value="custom">Personnalisee</option>
          </select>
        </div>
        <div class="col-md-2" *ngIf="filters.period === 'custom'">
          <label class="form-label mb-1">Date debut</label>
          <input class="form-control" type="date" [(ngModel)]="filters.dateFrom" />
        </div>
        <div class="col-md-2" *ngIf="filters.period === 'custom'">
          <label class="form-label mb-1">Date fin</label>
          <input class="form-control" type="date" [(ngModel)]="filters.dateTo" />
        </div>
        <div class="col-md-2">
          <label class="form-label mb-1">Granularite</label>
          <select class="form-select" [(ngModel)]="filters.groupBy">
            <option value="day">Jour</option>
            <option value="month">Mois</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label mb-1">Boutique</label>
          <select class="form-select" [(ngModel)]="filters.boutiqueId">
            <option value="">Toutes</option>
            <option *ngFor="let b of boutiquesFilter" [value]="b._id">{{ b.nom }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label mb-1">Statut commande</label>
          <select class="form-select" [(ngModel)]="filters.statut">
            <option value="">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="confirmee">Confirmee</option>
            <option value="en_preparation">En preparation</option>
            <option value="prete">Prete</option>
            <option value="en_livraison">En livraison</option>
            <option value="livree">Livree</option>
            <option value="annulee">Annulee</option>
            <option value="remboursee">Remboursee</option>
          </select>
        </div>
      </div>
      <div class="mt-3 d-flex gap-2">
        <button class="btn btn-sm btn-hero-primary" (click)="loadDashboardStats()" [disabled]="loadingStats">
          <span *ngIf="!loadingStats">Appliquer les filtres</span>
          <span *ngIf="loadingStats">Chargement...</span>
        </button>
        <button class="btn btn-sm btn-hero-secondary" (click)="resetFilters()" [disabled]="loadingStats">Reinitialiser</button>
      </div>
    </app-card>

    <div class="dashboard-section-head mb-2 d-flex align-items-center justify-content-between">
      <h6 class="mb-0">Statistiques financieres</h6>
      <small class="text-muted">Montants et rentabilite de la periode</small>
    </div>
    <div class="row g-3 dashboard-kpi-row dashboard-grid-row">
      <div class="col-md-6 col-xl-3 d-flex" *ngFor="let card of financeCards">
        <app-card [cardTitle]="card.title" cardClass="comp-card dashboard-kpi-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h3 class="mb-0">{{ card.value }}</h3>
              <p class="text-muted mb-0">{{ card.label }}</p>
            </div>
            <div class="avtar avtar-l rounded-circle" [ngClass]="card.bgClass">
              <i class="ti" [ngClass]="card.icon"></i>
            </div>
          </div>
        </app-card>
      </div>
    </div>

    <div class="dashboard-section-head mb-2 d-flex align-items-center justify-content-between">
      <h6 class="mb-0">Statistiques operationnelles</h6>
      <small class="text-muted">Suivi des commandes et niveau de service</small>
    </div>
    <div class="row g-3 dashboard-kpi-row dashboard-grid-row">
      <div class="col-md-6 col-xl-3 d-flex" *ngFor="let card of operationCards">
        <app-card [cardTitle]="card.title" cardClass="comp-card dashboard-kpi-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h3 class="mb-0">{{ card.value }}</h3>
              <p class="text-muted mb-0">{{ card.label }}</p>
            </div>
            <div class="avtar avtar-l rounded-circle" [ngClass]="card.bgClass">
              <i class="ti" [ngClass]="card.icon"></i>
            </div>
          </div>
        </app-card>
      </div>
    </div>

    <!-- Evolution -->
    <div class="dashboard-section-head mb-2 d-flex align-items-center justify-content-between">
      <h6 class="mb-0">Graphes d'evolution</h6>
      <small class="text-muted">Tendance temporelle sur la periode selectionnee</small>
    </div>
    <div class="row g-3 dashboard-grid-row">
      <div class="col-lg-6 d-flex">
        <app-card cardTitle="Evolution du chiffre d'affaires" cardClass="dashboard-chart-card">
          <div *ngIf="caChartReady">
            <apx-chart
              [series]="caChartOptions.series!"
              [chart]="caChartOptions.chart!"
              [noData]="caChartOptions.noData!"
              [xaxis]="caChartOptions.xaxis!"
              [yaxis]="caChartOptions.yaxis!"
              [stroke]="caChartOptions.stroke!"
              [colors]="caChartOptions.colors!"
              [dataLabels]="caChartOptions.dataLabels!"
              [grid]="caChartOptions.grid!"
              [tooltip]="caChartOptions.tooltip!"
              [fill]="caChartOptions.fill!"
              [markers]="caChartOptions.markers!"
            ></apx-chart>
          </div>
          <div *ngIf="!caChartReady" class="text-center text-muted py-5">Chargement...</div>
        </app-card>
      </div>
      <div class="col-lg-6 d-flex">
        <app-card cardTitle="Evolution du nombre de commandes" cardClass="dashboard-chart-card">
          <div *ngIf="cmdCountChartReady">
            <apx-chart
              [series]="cmdCountChartOptions.series!"
              [chart]="cmdCountChartOptions.chart!"
              [noData]="cmdCountChartOptions.noData!"
              [xaxis]="cmdCountChartOptions.xaxis!"
              [plotOptions]="cmdCountChartOptions.plotOptions!"
              [colors]="cmdCountChartOptions.colors!"
              [dataLabels]="cmdCountChartOptions.dataLabels!"
              [grid]="cmdCountChartOptions.grid!"
              [tooltip]="cmdCountChartOptions.tooltip!"
            ></apx-chart>
          </div>
          <div *ngIf="!cmdCountChartReady" class="text-center text-muted py-5">Chargement...</div>
        </app-card>
      </div>
    </div>

    <!-- Repartition -->
    <div class="dashboard-section-head mb-2 d-flex align-items-center justify-content-between">
      <h6 class="mb-0">Graphes de repartition</h6>
      <small class="text-muted">2 graphes filtres + 1 graphe global (categorie boutiques)</small>
    </div>
    <div class="row g-3 dashboard-grid-row">
      <div class="col-lg-4 d-flex">
        <app-card cardTitle="Repartition des commandes par statut" cardClass="dashboard-chart-card">
          <div *ngIf="cmdStatutChartReady">
            <apx-chart
              [series]="cmdStatutChartOptions.series!"
              [chart]="cmdStatutChartOptions.chart!"
              [noData]="cmdStatutChartOptions.noData!"
              [labels]="cmdStatutChartOptions.labels!"
              [colors]="cmdStatutChartOptions.colors!"
              [legend]="cmdStatutChartOptions.legend!"
              [dataLabels]="cmdStatutChartOptions.dataLabels!"
              [plotOptions]="cmdStatutChartOptions.plotOptions!"
              [responsive]="cmdStatutChartOptions.responsive!"
            ></apx-chart>
          </div>
          <div *ngIf="!cmdStatutChartReady" class="text-center text-muted py-5">Chargement...</div>
        </app-card>
      </div>
      <div class="col-lg-4 d-flex">
        <app-card cardTitle="Top 5 boutiques par chiffre d'affaires" cardClass="dashboard-chart-card">
          <div *ngIf="topBoutiqueChartReady">
            <apx-chart
              [series]="topBoutiqueChartOptions.series!"
              [chart]="topBoutiqueChartOptions.chart!"
              [noData]="topBoutiqueChartOptions.noData!"
              [xaxis]="topBoutiqueChartOptions.xaxis!"
              [plotOptions]="topBoutiqueChartOptions.plotOptions!"
              [colors]="topBoutiqueChartOptions.colors!"
              [dataLabels]="topBoutiqueChartOptions.dataLabels!"
              [grid]="topBoutiqueChartOptions.grid!"
              [tooltip]="topBoutiqueChartOptions.tooltip!"
            ></apx-chart>
          </div>
          <div *ngIf="!topBoutiqueChartReady" class="text-center text-muted py-5">Chargement...</div>
        </app-card>
      </div>
      <div class="col-lg-4 d-flex">
        <app-card cardTitle="Repartition des boutiques par categorie (global)" cardClass="dashboard-chart-card">
          <div *ngIf="categorieChartReady">
            <apx-chart
              [series]="categorieChartOptions.series!"
              [chart]="categorieChartOptions.chart!"
              [noData]="categorieChartOptions.noData!"
              [labels]="categorieChartOptions.labels!"
              [colors]="categorieChartOptions.colors!"
              [legend]="categorieChartOptions.legend!"
              [dataLabels]="categorieChartOptions.dataLabels!"
              [responsive]="categorieChartOptions.responsive!"
            ></apx-chart>
          </div>
          <div *ngIf="!categorieChartReady" class="text-center text-muted py-5">Chargement...</div>
        </app-card>
      </div>
    </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .admin-dashboard-theme {
      padding: 4px;
      background: linear-gradient(180deg, #f7f9ff 0%, #f4f6fb 100%);
      border-radius: 16px;
    }

    .dashboard-section-head {
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
      border: 1px solid #ecebff;
      border-left: 4px solid #667eea;
    }

    .dashboard-section-head h6 {
      color: #1f2a44;
      font-weight: 700;
    }

    .dashboard-filter-badge {
      padding: 8px 12px;
      border-radius: 999px;
      background: linear-gradient(135deg, #eef2ff, #ede9fe);
      color: #4c4ee2;
      border: 1px solid #dfe3ff;
      font-weight: 600;
    }

    .btn-hero-primary {
      border: none;
      color: #fff;
      border-radius: 10px;
      padding: 8px 14px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      box-shadow: 0 6px 14px rgba(102, 126, 234, 0.28);
    }

    .btn-hero-primary:hover {
      filter: brightness(1.03);
      transform: translateY(-1px);
    }

    .btn-hero-secondary {
      color: #4b5563;
      border-radius: 10px;
      padding: 8px 14px;
      border: 1px solid #d7dcef;
      background: #fff;
    }

    .btn-hero-secondary:hover {
      background: #f8faff;
    }

    .dashboard-kpi-row {
      margin-bottom: 2px;
    }

    :host ::ng-deep app-card {
      display: block;
      width: 100%;
    }

    :host ::ng-deep .dashboard-hero-card.card {
      border: 1px solid #e7e9ff;
      border-radius: 16px;
      box-shadow: 0 10px 24px rgba(15, 52, 96, 0.07);
      overflow: hidden;
    }

    :host ::ng-deep .dashboard-hero-header {
      background: linear-gradient(135deg, #f6f8ff, #f3edff);
      border-bottom: 1px solid #eaecff;
    }

    :host ::ng-deep .dashboard-kpi-card.card {
      height: 100%;
      border-radius: 14px;
      border: 1px solid #edf0fb;
      box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
    }

    :host ::ng-deep .dashboard-chart-card.card {
      height: 100%;
      border-radius: 14px;
      border: 1px solid #edf0fb;
      box-shadow: 0 8px 20px rgba(16, 24, 40, 0.07);
    }

    :host ::ng-deep .dashboard-chart-card .card-header h5,
    :host ::ng-deep .dashboard-kpi-card .card-header h5,
    :host ::ng-deep .dashboard-hero-card .card-header h5 {
      font-weight: 700;
      color: #1f2a44;
      margin-bottom: 0;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :host ::ng-deep .dashboard-kpi-card .card-header,
    :host ::ng-deep .dashboard-chart-card .card-header {
      min-height: 64px;
      display: flex;
      align-items: center;
    }

    :host ::ng-deep .dashboard-kpi-card .card-body {
      min-height: 130px;
      display: flex;
      align-items: center;
    }

    :host ::ng-deep .dashboard-chart-card .card-body {
      min-height: 360px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  financeCards: any[] = [];
  operationCards: any[] = [];
  boutiquesFilter: any[] = [];
  loadingStats = false;
  filters: any = {
    period: '30d',
    groupBy: 'day',
    dateFrom: '',
    dateTo: '',
    statut: '',
    boutiqueId: ''
  };

  // Chart flags
  caChartReady = true;
  topBoutiqueChartReady = true;
  cmdStatutChartReady = true;
  categorieChartReady = true;
  cmdCountChartReady = true;

  // Chart options
  caChartOptions: Partial<ApexOptions> = {};
  topBoutiqueChartOptions: Partial<ApexOptions> = {};
  cmdStatutChartOptions: Partial<ApexOptions> = {};
  categorieChartOptions: Partial<ApexOptions> = {};
  cmdCountChartOptions: Partial<ApexOptions> = {};

  constructor(private api: ApiService) {}

  private getDefaultStats(): any {
    return {
      totalCommandes: 0,
      commandesEnAttente: 0,
      commandesLivrees: 0,
      commandesAnnulees: 0,
      chiffreAffaires: 0,
      panierMoyen: 0,
      tauxConversion: 0,
      caMois: 0,
      ventesParMois: [],
      topBoutiques: [],
      parCategorie: [],
      commandesParStatut: []
    };
  }

  private initImmediateUiState(): void {
    this.stats = this.getDefaultStats();
    this.buildStatsCards();
    this.buildCAChart();
    this.buildTopBoutiqueChart();
    this.buildCmdStatutChart();
    this.buildCategorieChart();
    this.buildCmdCountChart();
  }

  ngOnInit(): void {
    this.initImmediateUiState();
    this.loadBoutiquesFilter();
    const hasCachedData = this.applyCachedDashboard();
    this.loadDashboardStats(!hasCachedData);
  }

  onPeriodChange(): void {
    if (this.filters.period === '12m') {
      this.filters.groupBy = 'month';
    } else if (this.filters.groupBy !== 'day' && this.filters.groupBy !== 'month') {
      this.filters.groupBy = 'day';
    }
  }

  resetFilters(): void {
    this.filters = {
      period: '30d',
      groupBy: 'day',
      dateFrom: '',
      dateTo: '',
      statut: '',
      boutiqueId: ''
    };
    this.loadDashboardStats();
  }

  loadBoutiquesFilter(): void {
    this.api.getBoutiques({ statut: 'active', limit: 500 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.boutiquesFilter = res.boutiques || [];
        }
      },
      error: () => {
        this.boutiquesFilter = [];
      }
    });
  }

  private buildDashboardParams(): any {
    const params: any = {
      period: this.filters.period,
      groupBy: this.filters.groupBy
    };
    if (this.filters.period === 'custom') {
      if (this.filters.dateFrom) params.dateFrom = this.filters.dateFrom;
      if (this.filters.dateTo) params.dateTo = this.filters.dateTo;
    }
    if (this.filters.statut) params.statut = this.filters.statut;
    if (this.filters.boutiqueId) params.boutiqueId = this.filters.boutiqueId;
    return params;
  }

  private applyDashboardPayload(res: any): void {
    this.stats = res.stats;
    this.buildStatsCards();
    this.buildCAChart();
    this.buildTopBoutiqueChart();
    this.buildCmdStatutChart();
    this.buildCategorieChart();
    this.buildCmdCountChart();
  }

  private applyDashboardStatsOnly(res: any): void {
    this.stats = {
      ...(this.stats || {}),
      ...(res.stats || {})
    };
    this.buildStatsCards();
  }

  private applyCachedDashboard(): boolean {
    const cached = this.api.getCachedAdminDashboardData(this.buildDashboardParams());
    if (cached?.success) {
      this.applyDashboardPayload(cached);
      return true;
    }
    return false;
  }

  loadDashboardStats(showLoader = true): void {
    const hasCachedData = this.applyCachedDashboard();
    this.loadingStats = showLoader && !hasCachedData;
    const params = this.buildDashboardParams();

    // First paint optimization: load lightweight stats first when nothing cached.
    if (!hasCachedData) {
      this.api.getAdminDashboard({ ...params, light: true }).subscribe({
        next: (res) => {
          if (res.success) {
            this.applyDashboardStatsOnly(res);
          }
        },
        error: () => {
          // ignore: full request below is the source of truth
        }
      });
    }

    this.api.getAdminDashboard(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.applyDashboardPayload(res);
        }
        this.loadingStats = false;
      },
      error: (err) => {
        this.loadingStats = false;
        console.error('Erreur dashboard:', err);
      }
    });
  }

  // ---- Stats Cards ----
  buildStatsCards(): void {
    const tauxAnnulation = this.getTauxAnnulation();
    this.financeCards = [
      {
        title: 'Chiffre d\'affaires',
        value: (this.stats.chiffreAffaires || 0).toLocaleString() + ' Ar',
        label: 'Periode selectionnee',
        bgClass: 'bg-light-info',
        icon: 'ti-currency-dollar'
      },
      {
        title: 'Panier moyen',
        value: (this.stats.panierMoyen || 0).toLocaleString() + ' Ar',
        label: 'Par commande validee',
        bgClass: 'bg-light-warning',
        icon: 'ti-receipt'
      },
      {
        title: 'Taux d\'annulation',
        value: tauxAnnulation + '%',
        label: (this.stats.commandesAnnulees || 0) + ' commande(s) annulee(s)',
        bgClass: 'bg-light-danger',
        icon: 'ti-alert-circle'
      },
      {
        title: 'CA du mois',
        value: (this.stats.caMois || 0).toLocaleString() + ' Ar',
        label: 'Reference mensuelle globale',
        bgClass: 'bg-light-primary',
        icon: 'ti-chart-bar'
      }
    ];

    this.operationCards = [
      {
        title: 'Commandes totales',
        value: this.stats.totalCommandes || 0,
        label: (this.stats.commandesEnAttente || 0) + ' en attente',
        bgClass: 'bg-light-danger',
        icon: 'ti-shopping-cart'
      },
      {
        title: 'Taux conversion',
        value: (this.stats.tauxConversion || 0) + '%',
        label: (this.stats.commandesLivrees || 0) + ' commandes livrees',
        bgClass: 'bg-light-success',
        icon: 'ti-trending-up'
      },
      {
        title: 'Commandes livrees',
        value: this.stats.commandesLivrees || 0,
        label: 'Commandes finalisees',
        bgClass: 'bg-light-success',
        icon: 'ti-checks'
      },
      {
        title: 'Commandes en attente',
        value: this.stats.commandesEnAttente || 0,
        label: 'A traiter rapidement',
        bgClass: 'bg-light-warning',
        icon: 'ti-hourglass'
      }
    ];
  }

  // ---- 1) Graphe CA par mois (area) ----
  buildCAChart(): void {
    const ventes = this.stats.ventesParMois || [];
    if (ventes.length === 0) {
      this.caChartOptions = {
        series: [],
        chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
        noData: { text: 'Aucune donnee disponible pour cette periode', align: 'center', verticalAlign: 'middle' }
      };
      this.caChartReady = true;
      return;
    }

    const categories = ventes.map((v: any) => this.formatMois(v._id));
    const dataCA = ventes.map((v: any) => v.total);

    this.caChartOptions = {
      series: [{ name: 'Chiffre d\'Affaires (Ar)', data: dataCA }],
      chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
      colors: ['#1677ff'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
      },
      markers: { size: 5, colors: ['#1677ff'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
      xaxis: {
        categories,
        labels: { style: { colors: '#8c8c8c' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: ['#8c8c8c'] },
          formatter: (val: number) => val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toString()
        }
      },
      grid: { strokeDashArray: 4, borderColor: '#f0f0f0' },
      dataLabels: { enabled: false },
      tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => val.toLocaleString() + ' Ar' }
      }
    };
    this.caChartReady = true;
  }

  // ---- 2) Top 5 Boutiques (horizontal bar) ----
  buildTopBoutiqueChart(): void {
    const top = this.stats.topBoutiques || [];
    if (top.length === 0) {
      this.topBoutiqueChartOptions = {
        series: [],
        chart: { type: 'bar', height: 320, toolbar: { show: false }, background: 'transparent' },
        noData: { text: 'Aucune boutique sur la periode', align: 'center', verticalAlign: 'middle' }
      };
      this.topBoutiqueChartReady = true;
      return;
    }

    const noms = top.map((b: any) => b.nom);
    const cas = top.map((b: any) => b.totalCA);

    this.topBoutiqueChartOptions = {
      series: [{ name: 'CA (Ar)', data: cas }],
      chart: { type: 'bar', height: 320, toolbar: { show: false }, background: 'transparent' },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '50%' } },
      colors: ['#13c2c2'],
      xaxis: {
        categories: noms,
        labels: {
          style: { colors: '#8c8c8c' },
          formatter: (val: string) => {
            const n = Number(val);
            return n >= 1000 ? (n / 1000).toFixed(0) + 'k' : val;
          }
        }
      },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: '#f0f0f0' },
      tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => val.toLocaleString() + ' Ar' }
      }
    };
    this.topBoutiqueChartReady = true;
  }

  // ---- 3) Commandes par Statut (donut) ----
  buildCmdStatutChart(): void {
    const statuts = this.stats.commandesParStatut || [];
    if (statuts.length === 0) {
      this.cmdStatutChartOptions = {
        series: [],
        labels: [],
        chart: { type: 'donut', height: 320, background: 'transparent' },
        noData: { text: 'Aucune commande pour cette selection', align: 'center', verticalAlign: 'middle' }
      };
      this.cmdStatutChartReady = true;
      return;
    }

    const labels = statuts.map((s: any) => s._id);
    const series = statuts.map((s: any) => s.count);
    const colorMap: any = {
      'en_attente': '#faad14', 'confirmee': '#1890ff', 'en_preparation': '#1677ff',
      'prete': '#52c41a', 'en_livraison': '#13c2c2', 'livree': '#389e0d',
      'annulee': '#ff4d4f', 'remboursee': '#8c8c8c'
    };
    const colors = labels.map((l: string) => colorMap[l] || '#d9d9d9');

    this.cmdStatutChartOptions = {
      series,
      chart: { type: 'donut', height: 320, background: 'transparent' },
      labels,
      colors,
      legend: { position: 'bottom', fontFamily: 'inherit' },
      dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(0) + '%' },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: { show: true, label: 'Total', formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) }
            }
          }
        }
      },
      responsive: [{ breakpoint: 480, options: { chart: { width: 280 }, legend: { position: 'bottom' } } }]
    };
    this.cmdStatutChartReady = true;
  }

  // ---- 4) Boutiques par categorie (pie) ----
  buildCategorieChart(): void {
    const cats = this.stats.parCategorie || [];
    if (cats.length === 0) {
      this.categorieChartOptions = {
        series: [],
        labels: [],
        chart: { type: 'pie', height: 320, background: 'transparent' },
        noData: { text: 'Aucune categorie a afficher', align: 'center', verticalAlign: 'middle' }
      };
      this.categorieChartReady = true;
      return;
    }

    const labels = cats.map((c: any) => c._id || 'Autre');
    const series = cats.map((c: any) => c.count);
    const palette = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#13c2c2', '#722ed1', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'];

    this.categorieChartOptions = {
      series,
      chart: { type: 'pie', height: 320, background: 'transparent' },
      labels,
      colors: palette.slice(0, labels.length),
      legend: { position: 'bottom', fontFamily: 'inherit' },
      dataLabels: { enabled: true },
      responsive: [{ breakpoint: 480, options: { chart: { width: 280 }, legend: { position: 'bottom' } } }]
    };
    this.categorieChartReady = true;
  }

  // ---- 5) Nb commandes par mois (bar chart) ----
  buildCmdCountChart(): void {
    const ventes = this.stats.ventesParMois || [];
    if (ventes.length === 0) {
      this.cmdCountChartOptions = {
        series: [],
        chart: { type: 'bar', height: 320, toolbar: { show: false }, background: 'transparent' },
        noData: { text: 'Aucune evolution disponible', align: 'center', verticalAlign: 'middle' }
      };
      this.cmdCountChartReady = true;
      return;
    }

    const categories = ventes.map((v: any) => this.formatMois(v._id));
    const dataCounts = ventes.map((v: any) => v.count);

    this.cmdCountChartOptions = {
      series: [{ name: 'Commandes', data: dataCounts }],
      chart: { type: 'bar', height: 320, toolbar: { show: false }, background: 'transparent' },
      plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
      colors: ['#52c41a'],
      xaxis: {
        categories,
        labels: { style: { colors: '#8c8c8c' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      dataLabels: { enabled: true, style: { fontSize: '12px', colors: ['#fff'] } },
      grid: { strokeDashArray: 4, borderColor: '#f0f0f0' },
      tooltip: { theme: 'light' }
    };
    this.cmdCountChartReady = true;
  }

  // ---- Helpers ----
  getStatutClass(statut: string): string {
    const classes: any = {
      'en_attente': 'bg-warning', 'confirmee': 'bg-info', 'en_preparation': 'bg-primary',
      'prete': 'bg-success', 'livree': 'bg-success', 'annulee': 'bg-danger', 'remboursee': 'bg-secondary',
      'en_livraison': 'bg-info'
    };
    return classes[statut] || 'bg-secondary';
  }

  getTauxAnnulation(): number {
    const total = Number(this.stats?.totalCommandes || 0);
    if (!total) return 0;
    const annulees = Number(this.stats?.commandesAnnulees || 0);
    return Math.round((annulees / total) * 100);
  }

  getActiveFilterLabel(): string {
    const labels: any = {
      '7d': 'Periode: 7 jours',
      '30d': 'Periode: 30 jours',
      '90d': 'Periode: 90 jours',
      '12m': 'Periode: 12 mois',
      custom: 'Periode personnalisee'
    };
    const base = labels[this.filters.period] || 'Periode personnalisable';
    const granularity = this.filters.groupBy === 'month' ? ' - Vue mensuelle' : ' - Vue journaliere';
    return base + granularity;
  }

  formatMois(moisStr: string): string {
    if (!moisStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(moisStr)) {
      const [year, month, day] = moisStr.split('-');
      return `${day}/${month}/${year.slice(2)}`;
    }
    const moisNoms = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = moisStr.split('-');
    const moisIndex = parseInt(parts[1], 10) - 1;
    return (moisNoms[moisIndex] || parts[1]) + ' ' + parts[0];
  }
}
