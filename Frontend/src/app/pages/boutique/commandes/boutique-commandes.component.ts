import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  SearchOutline,
  FilterOutline,
  ReloadOutline,
  EyeOutline,
  ClockCircleOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  ShoppingCartOutline,
  AccountBookOutline,
  CalendarOutline,
  ExclamationCircleOutline
} from '@ant-design/icons-angular/icons';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

interface Commande {
  _id: string;
  numero_commande: string;
  client_nom: string;
  client_email: string;
  montant_total: number;
  statut: string;
  date_creation: string;
  lignes: Array<{ nom_produit: string; quantite: number; prix_unitaire: number; prix_total: number; image_produit?: string }>;
}

@Component({
  selector: 'app-boutique-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, IconDirective],
  templateUrl: './boutique-commandes.component.html',
  styleUrls: ['./boutique-commandes.component.scss']
})
export class BoutiqueCommandesComponent implements OnInit {
  private api = inject(ApiService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private iconService = inject(IconService);

  constructor() {
    this.iconService.addIcon(
      SearchOutline, FilterOutline, ReloadOutline, EyeOutline,
      ClockCircleOutline, CheckCircleOutline, CloseCircleOutline,
      ShoppingCartOutline, AccountBookOutline, CalendarOutline,
      ExclamationCircleOutline
    );
  }

  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  loading = false;
  error: string | null = null;
  filterStatut = 'all';
  searchTerm = '';

  // Stats
  totalCommandes = 0;
  commandesEnAttente = 0;
  commandesLivrees = 0;
  totalRevenu = 0;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Détails
  selectedCommande: Commande | null = null;
  showDetailsModal = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['statut']) {
        this.filterStatut = params['statut'];
      }
    });
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.error = null;

    this.api.getCommandesBoutique().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.commandes = res.commandes || [];
          this.calculateStats();
          this.applyFilters();
          if (this.commandes.length === 0) {
            this.notificationService.info('Aucune commande trouvée pour votre boutique');
          }
        } else {
          this.error = res.message || 'Erreur lors du chargement';
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors du chargement';
        this.notificationService.error(this.error!);
      }
    });
  }

  calculateStats(): void {
    this.totalCommandes = this.commandes.length;
    this.commandesEnAttente = this.commandes.filter(c => c.statut === 'en_attente').length;
    this.commandesLivrees = this.commandes.filter(c => c.statut === 'livree').length;
    this.totalRevenu = this.commandes.reduce((sum, c) => sum + (c.montant_total || 0), 0);
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    if (this.filterStatut !== 'all') {
      filtered = filtered.filter(cmd => cmd.statut === this.filterStatut);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cmd =>
        cmd.numero_commande?.toLowerCase().includes(term) ||
        cmd.client_nom?.toLowerCase().includes(term) ||
        cmd.client_email?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
    this.commandesFiltrees = filtered;
    this.currentPage = 1;
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.commandesFiltrees.length / this.pageSize);
  }

  get paginatedCommandes(): Commande[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.commandesFiltrees.slice(start, start + this.pageSize);
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

  viewDetails(cmd: Commande): void {
    this.selectedCommande = cmd;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCommande = null;
  }

  updateStatut(id: string, statut: string): void {
    this.api.updateStatutCommande(id, statut).subscribe({
      next: () => {
        this.notificationService.success('Statut mis à jour');
        this.loadCommandes();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur mise à jour');
      }
    });
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'bg-warning',
      'confirmee': 'bg-info',
      'en_preparation': 'bg-primary',
      'prete': 'bg-success',
      'en_livraison': 'bg-success',
      'livree': 'bg-success',
      'annulee': 'bg-danger'
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
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }
}
