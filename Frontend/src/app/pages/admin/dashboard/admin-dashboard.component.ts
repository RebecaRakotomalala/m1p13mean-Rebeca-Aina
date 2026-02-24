import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { ApiService } from '../../../services/api.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, CardComponent, NgApexchartsModule],
  template: `
    <!-- KPIs principaux -->
    <div class="row">
      <div class="col-md-4 col-xl-3" *ngFor="let card of statsCards">
        <app-card [cardTitle]="card.title" cardClass="comp-card">
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

    <!-- Graphique CA par mois (area chart) + Top Boutiques (bar chart) -->
    <div class="row">
      <div class="col-md-8">
        <app-card cardTitle="Evolution du Chiffre d'Affaires (6 derniers mois)">
          <div *ngIf="caChartReady">
            <apx-chart
              [series]="caChartOptions.series!"
              [chart]="caChartOptions.chart!"
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

      <div class="col-md-4">
        <app-card cardTitle="Top 5 Boutiques (CA)">
          <div *ngIf="topBoutiqueChartReady">
            <apx-chart
              [series]="topBoutiqueChartOptions.series!"
              [chart]="topBoutiqueChartOptions.chart!"
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
    </div>

    <!-- Commandes par statut (donut) + Repartition par categorie (pie) -->
    <div class="row">
      <div class="col-md-6">
        <app-card cardTitle="Commandes par Statut">
          <div *ngIf="cmdStatutChartReady">
            <apx-chart
              [series]="cmdStatutChartOptions.series!"
              [chart]="cmdStatutChartOptions.chart!"
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

      <div class="col-md-6">
        <app-card cardTitle="Repartition Boutiques par Categorie">
          <div *ngIf="categorieChartReady">
            <apx-chart
              [series]="categorieChartOptions.series!"
              [chart]="categorieChartOptions.chart!"
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

    <!-- Nb commandes par mois (bar) + Alertes -->
    <div class="row">
      <div class="col-md-8">
        <app-card cardTitle="Nombre de Commandes par Mois">
          <div *ngIf="cmdCountChartReady">
            <apx-chart
              [series]="cmdCountChartOptions.series!"
              [chart]="cmdCountChartOptions.chart!"
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

      <div class="col-md-4">
        <app-card cardTitle="Alertes & Actions">
          <div class="list-group list-group-flush">
            <a *ngIf="stats?.boutiquesEnAttente > 0" [routerLink]="['/admin/boutiques']" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <span><i class="ti ti-building-store text-warning me-2"></i> Boutiques en attente</span>
              <span class="badge bg-warning rounded-pill">{{ stats.boutiquesEnAttente }}</span>
            </a>
            <a *ngIf="stats?.commandesEnAttente > 0" [routerLink]="['/admin/commandes']" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <span><i class="ti ti-shopping-cart text-danger me-2"></i> Commandes en attente</span>
              <span class="badge bg-danger rounded-pill">{{ stats.commandesEnAttente }}</span>
            </a>
            <a *ngIf="stats?.avisSignales > 0" [routerLink]="['/admin/avis']" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <span><i class="ti ti-alert-triangle text-warning me-2"></i> Avis signales</span>
              <span class="badge bg-warning rounded-pill">{{ stats.avisSignales }}</span>
            </a>
            <div *ngIf="stats?.boutiquesEnAttente === 0 && stats?.commandesEnAttente === 0 && stats?.avisSignales === 0"
              class="list-group-item text-center text-muted">
              <i class="ti ti-check me-1"></i> Aucune alerte
            </div>
          </div>
        </app-card>

        <!-- Mini recap chiffres -->
        <app-card cardTitle="Resume">
          <div class="d-flex justify-content-between mb-2 pb-2 border-bottom" *ngIf="stats">
            <span class="text-muted">Commandes livrees</span>
            <strong class="text-success">{{ stats.commandesLivrees }}</strong>
          </div>
          <div class="d-flex justify-content-between mb-2 pb-2 border-bottom" *ngIf="stats">
            <span class="text-muted">Commandes annulees</span>
            <strong class="text-danger">{{ stats.commandesAnnulees }}</strong>
          </div>
          <div class="d-flex justify-content-between mb-2 pb-2 border-bottom" *ngIf="stats">
            <span class="text-muted">Nouveaux ce mois</span>
            <strong class="text-primary">{{ stats.nouveauxUsers }} utilisateur(s)</strong>
          </div>
          <div class="d-flex justify-content-between" *ngIf="stats">
            <span class="text-muted">Avis signales</span>
            <strong [ngClass]="stats.avisSignales > 0 ? 'text-warning' : 'text-success'">{{ stats.avisSignales }}</strong>
          </div>
        </app-card>
      </div>
    </div>

    <!-- Commandes recentes -->
    <div class="row">
      <div class="col-12">
        <app-card cardTitle="Commandes Recentes">
          <div class="table-responsive" *ngIf="stats?.commandesRecentes?.length > 0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cmd of stats.commandesRecentes | slice:0:7">
                  <td><code>{{ $any(cmd).numero_commande }}</code></td>
                  <td>{{ $any(cmd).client_nom || 'N/A' }}</td>
                  <td><strong>{{ $any(cmd).montant_total | number:'1.0-0' }} Ar</strong></td>
                  <td><span class="badge" [ngClass]="getStatutClass($any(cmd).statut)">{{ $any(cmd).statut }}</span></td>
                  <td>{{ $any(cmd).date_creation | date:'dd/MM/yy HH:mm' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="!stats?.commandesRecentes?.length" class="text-center text-muted py-3">Aucune commande</div>
          <div class="text-end mt-2" *ngIf="stats?.commandesRecentes?.length > 0">
            <a [routerLink]="['/admin/commandes']" class="btn btn-sm btn-outline-primary">Voir toutes les commandes</a>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  statsCards: any[] = [];

  // Chart flags
  caChartReady = false;
  topBoutiqueChartReady = false;
  cmdStatutChartReady = false;
  categorieChartReady = false;
  cmdCountChartReady = false;

  // Chart options
  caChartOptions: Partial<ApexOptions> = {};
  topBoutiqueChartOptions: Partial<ApexOptions> = {};
  cmdStatutChartOptions: Partial<ApexOptions> = {};
  categorieChartOptions: Partial<ApexOptions> = {};
  cmdCountChartOptions: Partial<ApexOptions> = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.stats;
          this.buildStatsCards();
          this.buildCAChart();
          this.buildTopBoutiqueChart();
          this.buildCmdStatutChart();
          this.buildCategorieChart();
          this.buildCmdCountChart();
        }
      },
      error: (err) => console.error('Erreur dashboard:', err)
    });
  }

  // ---- Stats Cards ----
  buildStatsCards(): void {
    this.statsCards = [
      { title: 'Utilisateurs', value: this.stats.totalUsers, label: this.stats.nouveauxUsers + ' nouveaux ce mois', bgClass: 'bg-light-primary', icon: 'ti-users' },
      { title: 'Boutiques', value: this.stats.totalBoutiques, label: this.stats.boutiquesActives + ' actives', bgClass: 'bg-light-success', icon: 'ti-building-store' },
      { title: 'Produits', value: this.stats.totalProduits, label: 'Produits actifs', bgClass: 'bg-light-warning', icon: 'ti-package' },
      { title: 'Commandes', value: this.stats.totalCommandes, label: this.stats.commandesEnAttente + ' en attente', bgClass: 'bg-light-danger', icon: 'ti-shopping-cart' },
      { title: 'CA Total', value: (this.stats.chiffreAffaires || 0).toLocaleString() + ' Ar', label: 'Chiffre d\'affaires global', bgClass: 'bg-light-info', icon: 'ti-currency-dollar' },
      { title: 'CA du Mois', value: (this.stats.caMois || 0).toLocaleString() + ' Ar', label: 'Mois en cours', bgClass: 'bg-light-primary', icon: 'ti-chart-bar' },
      { title: 'Panier Moyen', value: (this.stats.panierMoyen || 0).toLocaleString() + ' Ar', label: 'Par commande', bgClass: 'bg-light-warning', icon: 'ti-receipt' },
      { title: 'Taux Conversion', value: this.stats.tauxConversion + '%', label: 'Commandes livrees', bgClass: 'bg-light-success', icon: 'ti-trending-up' }
    ];
  }

  // ---- 1) Graphe CA par mois (area) ----
  buildCAChart(): void {
    const ventes = this.stats.ventesParMois || [];
    if (ventes.length === 0) { this.caChartReady = true; return; }

    const categories = ventes.map((v: any) => this.formatMois(v._id));
    const dataCA = ventes.map((v: any) => v.total);

    this.caChartOptions = {
      series: [{ name: 'Chiffre d\'Affaires (Ar)', data: dataCA }],
      chart: { type: 'area', height: 350, toolbar: { show: false }, background: 'transparent' },
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
    if (top.length === 0) { this.topBoutiqueChartReady = true; return; }

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
    if (statuts.length === 0) { this.cmdStatutChartReady = true; return; }

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
      chart: { type: 'donut', height: 340, background: 'transparent' },
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
    if (cats.length === 0) { this.categorieChartReady = true; return; }

    const labels = cats.map((c: any) => c._id || 'Autre');
    const series = cats.map((c: any) => c.count);
    const palette = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#13c2c2', '#722ed1', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'];

    this.categorieChartOptions = {
      series,
      chart: { type: 'pie', height: 340, background: 'transparent' },
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
    if (ventes.length === 0) { this.cmdCountChartReady = true; return; }

    const categories = ventes.map((v: any) => this.formatMois(v._id));
    const dataCounts = ventes.map((v: any) => v.count);

    this.cmdCountChartOptions = {
      series: [{ name: 'Commandes', data: dataCounts }],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, background: 'transparent' },
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

  formatMois(moisStr: string): string {
    const moisNoms = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = moisStr.split('-');
    const moisIndex = parseInt(parts[1], 10) - 1;
    return moisNoms[moisIndex] + ' ' + parts[0];
  }
}
