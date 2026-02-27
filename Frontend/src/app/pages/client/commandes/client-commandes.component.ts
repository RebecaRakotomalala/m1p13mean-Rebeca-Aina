import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-client-commandes',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-commandes.component.html',
  styleUrls: ['./client-commandes.component.scss']
})
export class ClientCommandesComponent implements OnInit {
  commandes: any[] = [];
  loading = true;
  filtreStatut = '';
  searchTerm = '';
  expandedCmd: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.api.getMyCommandes().subscribe({
      next: (res) => {
        if (res.success) this.commandes = res.commandes;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get commandesFiltrees(): any[] {
    let result = this.commandes;
    if (this.filtreStatut) {
      result = result.filter(c => c.statut === this.filtreStatut);
    }
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.numero_commande?.toLowerCase().includes(s) ||
        c.lignes?.some((l: any) => l.nom_produit?.toLowerCase().includes(s))
      );
    }
    return result;
  }

  get stats() {
    const total = this.commandes.length;
    const enCours = this.commandes.filter(c => ['en_attente', 'confirmee', 'en_preparation', 'prete'].includes(c.statut)).length;
    const livrees = this.commandes.filter(c => c.statut === 'livree').length;
    const montantTotal = this.commandes.reduce((s: number, c: any) => s + (c.montant_total || 0), 0);
    return { total, enCours, livrees, montantTotal };
  }

  toggleExpand(id: string): void {
    this.expandedCmd = this.expandedCmd === id ? null : id;
  }

  isExpanded(id: string): boolean {
    return this.expandedCmd === id;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
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

  getStatutClass(statut: string): string {
    const c: any = {
      'en_attente': 'status-warning',
      'confirmee': 'status-info',
      'en_preparation': 'status-primary',
      'prete': 'status-success',
      'en_livraison': 'status-info',
      'livree': 'status-success',
      'annulee': 'status-danger',
      'remboursee': 'status-danger'
    };
    return c[statut] || 'status-secondary';
  }

  getStatutIcon(statut: string): string {
    const icons: any = {
      'en_attente': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'confirmee': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'en_preparation': 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      'prete': 'M5 13l4 4L19 7',
      'en_livraison': 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
      'livree': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'annulee': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'remboursee': 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6'
    };
    return icons[statut] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  getProgressSteps(statut: string): { label: string; done: boolean; active: boolean }[] {
    const allSteps = ['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree'];
    const labels: any = {
      'en_attente': 'Attente',
      'confirmee': 'Confirmée',
      'en_preparation': 'Préparation',
      'prete': 'Prête',
      'livree': 'Livrée'
    };

    if (statut === 'annulee' || statut === 'remboursee') {
      return [{ label: this.getStatutLabel(statut), done: false, active: true }];
    }

    const currentIdx = allSteps.indexOf(statut);
    return allSteps.map((s, i) => ({
      label: labels[s],
      done: i < currentIdx,
      active: i === currentIdx
    }));
  }

  getLivraisonLabel(mode: string): string {
    const labels: any = {
      'retrait_boutique': 'Retrait en boutique',
      'livraison_domicile': 'Livraison à domicile',
      'consigne_automatique': 'Consigne automatique'
    };
    return labels[mode] || mode || 'N/A';
  }

  getPaiementLabel(statut: string): string {
    const labels: any = {
      'en_attente': 'En attente',
      'paye': 'Payé',
      'echoue': 'Échoué',
      'rembourse': 'Remboursé'
    };
    return labels[statut] || statut || 'N/A';
  }
}
