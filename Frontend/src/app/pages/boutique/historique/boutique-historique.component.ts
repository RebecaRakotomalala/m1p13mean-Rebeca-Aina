import { Component, OnInit, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  HistoryOutline,
  SearchOutline,
  FilterOutline,
  CalendarOutline,
  DownloadOutline,
  EyeOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  CloseCircleOutline,
  AccountBookOutline,
  ShoppingOutline,
  BarChartOutline,
  ReloadOutline
} from '@ant-design/icons-angular/icons';
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

interface Commande {
  _id: string;
  numero_commande: string;
  client_nom: string;
  client_email: string;
  montant_total: number;
  sous_total: number;
  frais_livraison: number;
  statut: string;
  statut_paiement: string;
  date_creation: Date;
  date_confirmation?: Date;
  date_livraison?: Date;
  lignes?: Array<{
    nom_produit: string;
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
  }>;
}

@Component({
  selector: 'app-boutique-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, IconDirective, NgApexchartsModule],
  templateUrl: './boutique-historique.component.html',
  styleUrls: ['./boutique-historique.component.scss']
})
export class BoutiqueHistoriqueComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private iconService = inject(IconService);

  // Charts
  salesHistoryChart = viewChild<ChartComponent>('salesHistoryChart');
  ordersHistoryChart = viewChild<ChartComponent>('ordersHistoryChart');
  
  salesHistoryChartOptions!: Partial<ApexOptions>;
  ordersHistoryChartOptions!: Partial<ApexOptions>;

  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  searchTerm = '';
  filterStatut = 'all';
  filterPaiement = 'all';
  filterDateDebut: string = '';
  filterDateFin: string = '';
  filterMontantMin: number | null = null;
  filterMontantMax: number | null = null;

  // Statistiques
  stats = {
    totalCommandes: 0,
    totalVentes: 0,
    commandesLivrees: 0,
    commandesEnAttente: 0,
    moyennePanier: 0,
    meilleurMois: '',
    meilleurMoisVentes: 0
  };

  // Vue
  viewMode: 'list' | 'chart' = 'list';
  selectedCommande: Commande | null = null;
  showDetailsModal = false;

  // Statuts disponibles
  statuts = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'prete', label: 'Prête' },
    { value: 'en_livraison', label: 'En livraison' },
    { value: 'livree', label: 'Livrée' },
    { value: 'annulee', label: 'Annulée' }
  ];

  constructor() {
    // Enregistrer les icônes nécessaires
    this.iconService.addIcon(
      HistoryOutline,
      SearchOutline,
      FilterOutline,
      CalendarOutline,
      DownloadOutline,
      EyeOutline,
      CheckCircleOutline,
      ClockCircleOutline,
      CloseCircleOutline,
      AccountBookOutline,
      ShoppingOutline,
      BarChartOutline,
      ReloadOutline
    );
  }

  ngOnInit(): void {
    this.initializeDateFilters();
    this.loadHistorique();
  }

  initializeDateFilters(): void {
    // Par défaut : 30 derniers jours
    const dateFin = new Date();
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - 30);
    
    this.filterDateDebut = dateDebut.toISOString().split('T')[0];
    this.filterDateFin = dateFin.toISOString().split('T')[0];
  }

  loadHistorique(): void {
    this.loading = true;
    this.error = null;

    this.api.getCommandesBoutique().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.commandes = res.commandes || [];
          this.calculateStats();
          this.applyFilters();
          this.initCharts();
        } else {
          this.error = res.message || 'Erreur lors du chargement de l\'historique';
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || err.message || 'Erreur lors du chargement de l\'historique';
        this.error = errorMessage;
        this.notificationService.error(errorMessage);
        console.error('Erreur chargement historique:', err);
      }
    });
  }

  calculateStats(): void {
    const commandesLivrees = this.commandes.filter(c => c.statut === 'livree');
    const commandesEnAttente = this.commandes.filter(c => c.statut === 'en_attente');
    
    this.stats.totalCommandes = this.commandes.length;
    this.stats.totalVentes = this.commandes.reduce((sum, c) => sum + (c.montant_total || 0), 0);
    this.stats.commandesLivrees = commandesLivrees.length;
    this.stats.commandesEnAttente = commandesEnAttente.length;
    this.stats.moyennePanier = this.commandes.length > 0 
      ? this.stats.totalVentes / this.commandes.length 
      : 0;

    // Meilleur mois
    const ventesParMois: { [key: string]: number } = {};
    this.commandes.forEach(c => {
      const mois = new Date(c.date_creation).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      ventesParMois[mois] = (ventesParMois[mois] || 0) + (c.montant_total || 0);
    });

    const meilleurMois = Object.entries(ventesParMois).reduce((a, b) => 
      ventesParMois[a[0]] > ventesParMois[b[0]] ? a : b, 
      ['', 0]
    );
    
    this.stats.meilleurMois = meilleurMois[0];
    this.stats.meilleurMoisVentes = meilleurMois[1];
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.numero_commande.toLowerCase().includes(term) ||
        c.client_nom?.toLowerCase().includes(term) ||
        c.client_email?.toLowerCase().includes(term)
      );
    }

    // Filtre statut
    if (this.filterStatut !== 'all') {
      filtered = filtered.filter(c => c.statut === this.filterStatut);
    }

    // Filtre paiement
    if (this.filterPaiement !== 'all') {
      filtered = filtered.filter(c => c.statut_paiement === this.filterPaiement);
    }

    // Filtre date
    if (this.filterDateDebut) {
      const dateDebut = new Date(this.filterDateDebut);
      filtered = filtered.filter(c => new Date(c.date_creation) >= dateDebut);
    }

    if (this.filterDateFin) {
      const dateFin = new Date(this.filterDateFin);
      dateFin.setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => new Date(c.date_creation) <= dateFin);
    }

    // Filtre montant
    if (this.filterMontantMin !== null) {
      filtered = filtered.filter(c => c.montant_total >= this.filterMontantMin!);
    }

    if (this.filterMontantMax !== null) {
      filtered = filtered.filter(c => c.montant_total <= this.filterMontantMax!);
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

    this.commandesFiltrees = filtered;
  }

  initCharts(): void {
    // Grouper les ventes par jour
    const ventesParJour: { [key: string]: number } = {};
    const commandesParJour: { [key: string]: number } = {};

    this.commandesFiltrees.forEach(c => {
      const date = new Date(c.date_creation).toLocaleDateString('fr-FR');
      ventesParJour[date] = (ventesParJour[date] || 0) + (c.montant_total || 0);
      commandesParJour[date] = (commandesParJour[date] || 0) + 1;
    });

    const dates = Object.keys(ventesParJour).sort((a, b) => 
      new Date(a.split('/').reverse().join('-')).getTime() - 
      new Date(b.split('/').reverse().join('-')).getTime()
    );

    // Graphique des ventes
    this.salesHistoryChartOptions = {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 800 }
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
          data: dates.map(date => ventesParJour[date] || 0)
        }
      ],
      xaxis: {
        categories: dates,
        labels: { style: { colors: '#8c8c8c' } }
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

    // Graphique des commandes
    this.ordersHistoryChartOptions = {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 800 }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 8
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toString()
      },
      colors: ['#52c41a'],
      series: [
        {
          name: 'Nombre de commandes',
          data: dates.map(date => commandesParJour[date] || 0)
        }
      ],
      xaxis: {
        categories: dates,
        labels: { style: { colors: '#8c8c8c' } }
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

  onFilterChange(): void {
    this.applyFilters();
    if (this.viewMode === 'chart') {
      this.initCharts();
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatut = 'all';
    this.filterPaiement = 'all';
    this.filterMontantMin = null;
    this.filterMontantMax = null;
    this.initializeDateFilters();
    this.applyFilters();
    if (this.viewMode === 'chart') {
      this.initCharts();
    }
  }

  viewDetails(commande: Commande): void {
    this.selectedCommande = commande;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCommande = null;
  }

  exportData(): void {
    // Créer un CSV
    const headers = ['Numéro', 'Client', 'Date', 'Montant', 'Statut', 'Paiement'];
    const rows = this.commandesFiltrees.map(c => [
      c.numero_commande,
      c.client_nom || '',
      new Date(c.date_creation).toLocaleDateString('fr-FR'),
      c.montant_total.toString(),
      c.statut,
      c.statut_paiement
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique-commandes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.notificationService.success('Données exportées avec succès!');
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'bg-warning',
      'confirmee': 'bg-info',
      'en_preparation': 'bg-primary',
      'prete': 'bg-success',
      'en_livraison': 'bg-success',
      'livree': 'bg-success',
      'annulee': 'bg-danger',
      'remboursee': 'bg-secondary'
    };
    return classes[statut] || 'bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_preparation': 'En préparation',
      'prete': 'Prête',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée',
      'remboursee': 'Remboursée'
    };
    return labels[statut] || statut;
  }

  getPaiementClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'bg-warning',
      'paye': 'bg-success',
      'echoue': 'bg-danger',
      'rembourse': 'bg-secondary'
    };
    return classes[statut] || 'bg-secondary';
  }

  getPaiementLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'paye': 'Payé',
      'echoue': 'Échoué',
      'rembourse': 'Remboursé'
    };
    return labels[statut] || statut;
  }
}

