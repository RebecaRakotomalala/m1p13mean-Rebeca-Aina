import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  ContainerOutline,
  WarningOutline,
  CloseCircleOutline,
  AccountBookOutline,
  SearchOutline,
  FilterOutline,
  ReloadOutline,
  EditOutline,
  CheckCircleOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  LineChartOutline,
  CalendarOutline,
  HistoryOutline,
  EyeOutline,
  ExclamationCircleOutline,
  UploadOutline,
  FileOutline,
  DownloadOutline,
  DeleteOutline,
  PlusOutline
} from '@ant-design/icons-angular/icons';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

interface ProduitStock {
  _id: string;
  nom: string;
  categorie: string;
  stock_quantite: number;
  stock_seuil_alerte: number;
  stock_illimite: boolean;
  prix_initial: number;
  prix_promo?: number;
  image_principale?: string;
  actif: boolean;
  nombre_ventes: number;
  date_creation: string;
  date_modification: string;
}

interface Mouvement {
  _id: string;
  nom_produit: string;
  image_produit?: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  date_creation: string;
  produit_id?: { nom: string; image_principale?: string };
  commande_id?: { numero_commande: string; statut: string; client_nom?: string };
}

interface TopProduit {
  nom: string;
  image?: string;
  stock_actuel: number;
  totalVendu: number;
  totalRevenu: number;
}

interface CsvRow {
  nom: string;
  categorie: string;
  prix_achat: number;
  quantite: number;
  reference_sku?: string;
}

@Component({
  selector: 'app-boutique-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, IconDirective, NgApexchartsModule],
  templateUrl: './boutique-stock.component.html',
  styleUrls: ['./boutique-stock.component.scss']
})
export class BoutiqueStockComponent implements OnInit {
  private api = inject(ApiService);
  private notificationService = inject(NotificationService);
  private iconService = inject(IconService);

  constructor() {
    this.iconService.addIcon(
      ContainerOutline,
      WarningOutline,
      CloseCircleOutline,
      AccountBookOutline,
      SearchOutline,
      FilterOutline,
      ReloadOutline,
      EditOutline,
      CheckCircleOutline,
      ArrowUpOutline,
      ArrowDownOutline,
      LineChartOutline,
      CalendarOutline,
      HistoryOutline,
      EyeOutline,
      ExclamationCircleOutline,
      UploadOutline,
      FileOutline,
      DownloadOutline,
      DeleteOutline,
      PlusOutline
    );
  }

  // Data
  produits: ProduitStock[] = [];
  produitsFiltres: ProduitStock[] = [];
  mouvements: Mouvement[] = [];
  topProduits: TopProduit[] = [];
  loading = true;

  // Stats
  totalProduits = 0;
  totalStock = 0;
  stockFaible = 0;
  rupture = 0;
  valeurStock = 0;

  // Filtres
  searchTerm = '';
  filterStock = 'all'; // all, low, out, ok
  filterCategorie = '';
  categories: string[] = [];

  // Historique dates
  dateDebut = '';
  dateFin = '';

  // Pagination stock
  currentPage = 1;
  pageSize = 10;

  // Pagination mouvements
  mvtPage = 1;
  mvtPageSize = 20;

  // Edition stock
  editingId: string | null = null;
  editingQte = 0;

  // Mini chart par produit
  selectedProduit: ProduitStock | null = null;
  showMiniChart = false;

  // Charts
  evolutionChartOptions!: Partial<ApexOptions>;
  topProduitsChartOptions!: Partial<ApexOptions>;

  // CSV Import
  csvData: CsvRow[] = [];
  csvFileName = '';
  csvImporting = false;
  csvResult: { created: number; updated: number; errors: string[]; total: number } | null = null;

  // Modal saisie manuelle
  showManualModal = false;
  manualSaving = false;
  manualForm = {
    nom: '',
    categorie: '',
    prix_achat: null as number | null,
    quantite: null as number | null,
    reference_sku: ''
  };
  manualErrors: { [key: string]: string } = {};
  categoriesDisponibles: string[] = [];

  // Tabs
  activeTab: 'stock' | 'historique' | 'csv' = 'stock';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const dateDebut = this.dateDebut || undefined;
    const dateFin = this.dateFin || undefined;

    this.api.getStockStats(dateDebut, dateFin).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          // Stats
          this.totalProduits = res.stats?.totalProduits || 0;
          this.totalStock = res.stats?.totalStock || 0;
          this.stockFaible = res.stats?.stockFaible || 0;
          this.rupture = res.stats?.rupture || 0;
          this.valeurStock = res.stats?.valeurStock || 0;
          this.topProduits = res.stats?.topProduits || [];

          // Produits
          this.produits = res.produits || [];
          this.extractCategories();
          this.applyFilters();

          // Mouvements
          this.mouvements = res.mouvements || [];

          // Charts
          this.initCharts(res.evolutionStock || []);
        } else {
          this.notificationService.error(res.message || 'Erreur chargement stock');
        }
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Erreur chargement stock');
      }
    });
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.produits.forEach(p => {
      if (p.categorie) cats.add(p.categorie);
    });
    this.categories = Array.from(cats).sort();
    this.categoriesDisponibles = [...this.categories];
  }

  applyFilters(): void {
    let filtered = [...this.produits];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom?.toLowerCase().includes(term) ||
        p.categorie?.toLowerCase().includes(term)
      );
    }

    if (this.filterCategorie) {
      filtered = filtered.filter(p => p.categorie === this.filterCategorie);
    }

    if (this.filterStock === 'low') {
      filtered = filtered.filter(p => !p.stock_illimite && p.stock_quantite > 0 && p.stock_quantite <= (p.stock_seuil_alerte || 5));
    } else if (this.filterStock === 'out') {
      filtered = filtered.filter(p => !p.stock_illimite && p.stock_quantite === 0);
    } else if (this.filterStock === 'ok') {
      filtered = filtered.filter(p => p.stock_illimite || p.stock_quantite > (p.stock_seuil_alerte || 5));
    }

    this.produitsFiltres = filtered;
    this.currentPage = 1; // Reset page on filter change
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.produitsFiltres.length / this.pageSize);
  }

  get paginatedProduits(): ProduitStock[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.produitsFiltres.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // ellipsis
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Pagination mouvements
  get totalMvtPages(): number {
    return Math.ceil(this.mouvements.length / this.mvtPageSize);
  }

  get paginatedMouvements(): Mouvement[] {
    const start = (this.mvtPage - 1) * this.mvtPageSize;
    return this.mouvements.slice(start, start + this.mvtPageSize);
  }

  get mvtPages(): number[] {
    const total = this.totalMvtPages;
    const current = this.mvtPage;
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

  goToMvtPage(page: number): void {
    if (page >= 1 && page <= this.totalMvtPages) {
      this.mvtPage = page;
    }
  }

  // Edition rapide du stock
  startEdit(produit: ProduitStock): void {
    this.editingId = produit._id;
    this.editingQte = produit.stock_quantite;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveStock(produit: ProduitStock): void {
    if (this.editingQte < 0) {
      this.notificationService.warning('La quantité ne peut pas être négative');
      return;
    }

    this.api.updateStock(produit._id, this.editingQte).subscribe({
      next: () => {
        produit.stock_quantite = this.editingQte;
        this.editingId = null;
        this.notificationService.success(`Stock de "${produit.nom}" mis à jour`);
        // Recalculer les stats
        this.recalcStats();
        this.applyFilters();
      },
      error: () => {
        this.notificationService.error('Erreur mise à jour du stock');
      }
    });
  }

  recalcStats(): void {
    this.totalStock = this.produits.reduce((sum, p) => sum + (p.stock_illimite ? 0 : p.stock_quantite), 0);
    this.stockFaible = this.produits.filter(p => !p.stock_illimite && p.stock_quantite > 0 && p.stock_quantite <= (p.stock_seuil_alerte || 5)).length;
    this.rupture = this.produits.filter(p => !p.stock_illimite && p.stock_quantite === 0).length;
    this.valeurStock = this.produits.reduce((sum, p) => {
      if (p.stock_illimite) return sum;
      const prix = p.prix_promo || p.prix_initial;
      return sum + (prix * p.stock_quantite);
    }, 0);
  }

  filterByDate(): void {
    this.loadData();
  }

  resetDateFilter(): void {
    this.dateDebut = '';
    this.dateFin = '';
    this.loadData();
  }

  getStockBadgeClass(produit: ProduitStock): string {
    if (produit.stock_illimite) return 'badge-unlimited';
    if (produit.stock_quantite === 0) return 'badge-danger';
    if (produit.stock_quantite <= (produit.stock_seuil_alerte || 5)) return 'badge-warning';
    return 'badge-success';
  }

  getStockLabel(produit: ProduitStock): string {
    if (produit.stock_illimite) return '∞ Illimité';
    if (produit.stock_quantite === 0) return '✕ Rupture';
    if (produit.stock_quantite <= (produit.stock_seuil_alerte || 5)) return `⚠ ${produit.stock_quantite}`;
    return `✓ ${produit.stock_quantite}`;
  }

  getStockPercent(produit: ProduitStock): number {
    if (produit.stock_illimite) return 100;
    const max = Math.max(produit.stock_quantite, (produit.stock_seuil_alerte || 5) * 4, 20);
    return Math.min(100, (produit.stock_quantite / max) * 100);
  }

  getProgressClass(produit: ProduitStock): string {
    if (produit.stock_illimite) return 'bg-info';
    if (produit.stock_quantite === 0) return 'bg-danger';
    if (produit.stock_quantite <= (produit.stock_seuil_alerte || 5)) return 'bg-warning';
    return 'bg-success';
  }

  getMouvementType(mouvement: Mouvement): string {
    const statut = mouvement.commande_id?.statut;
    if (statut === 'annulee') return 'Retour';
    return 'Vente';
  }

  getMouvementClass(mouvement: Mouvement): string {
    const statut = mouvement.commande_id?.statut;
    if (statut === 'annulee') return 'text-success';
    return 'text-danger';
  }

  getMouvementIcon(mouvement: Mouvement): string {
    const statut = mouvement.commande_id?.statut;
    if (statut === 'annulee') return 'arrow-up';
    return 'arrow-down';
  }

  // === CSV Import ===
  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.csvFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCsv(text);
    };
    reader.readAsText(file);
  }

  parseCsv(text: string): void {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      this.notificationService.warning('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
      return;
    }

    const header = lines[0];
    const separator = header.includes(';') ? ';' : ',';
    const headers = header.split(separator).map(h => h.trim().toLowerCase().replace(/"/g, ''));

    // Colonnes requises
    const nomIndex = headers.findIndex(h => ['nom', 'produit', 'name'].includes(h));
    const catIndex = headers.findIndex(h => ['categorie', 'catégorie', 'category', 'cat'].includes(h));
    const prixIndex = headers.findIndex(h => ['prix_achat', 'prix achat', 'cout', 'cost', 'prix'].includes(h));
    const qteIndex = headers.findIndex(h => ['quantite', 'quantité', 'qty', 'quantity', 'stock', 'qte'].includes(h));
    const skuIndex = headers.findIndex(h => ['reference_sku', 'sku', 'ref', 'reference'].includes(h));

    const missing: string[] = [];
    if (nomIndex === -1) missing.push('nom (ou produit)');
    if (catIndex === -1) missing.push('categorie');
    if (prixIndex === -1) missing.push('prix_achat (ou cout)');
    if (qteIndex === -1) missing.push('quantite (ou qty)');

    if (missing.length > 0) {
      this.notificationService.error(`Colonnes manquantes : ${missing.join(', ')}`);
      return;
    }

    this.csvData = [];
    const erreurs: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ''));
      const nom = cols[nomIndex]?.trim() || '';
      const categorie = cols[catIndex]?.trim() || '';
      const prixAchat = parseFloat(cols[prixIndex]);
      const quantite = parseInt(cols[qteIndex], 10);

      if (!nom) { erreurs.push(`Ligne ${i + 1}: nom vide`); continue; }
      if (!categorie) { erreurs.push(`Ligne ${i + 1}: catégorie vide`); continue; }
      if (isNaN(prixAchat) || prixAchat < 0) { erreurs.push(`Ligne ${i + 1}: prix invalide "${cols[prixIndex]}"`); continue; }
      if (isNaN(quantite) || quantite < 0) { erreurs.push(`Ligne ${i + 1}: quantité invalide "${cols[qteIndex]}"`); continue; }

      this.csvData.push({
        nom,
        categorie,
        prix_achat: prixAchat,
        quantite,
        reference_sku: skuIndex !== -1 ? cols[skuIndex]?.trim() : undefined
      });
    }

    if (erreurs.length > 0) {
      this.notificationService.warning(`${erreurs.length} ligne(s) ignorée(s) pour erreurs`);
    }
    if (this.csvData.length > 0) {
      this.notificationService.success(`${this.csvData.length} produit(s) détecté(s) dans le CSV`);
    }
  }

  importCsv(): void {
    if (this.csvData.length === 0) {
      this.notificationService.warning('Aucune donnée à importer');
      return;
    }

    this.csvImporting = true;
    this.api.importStockCsv(this.csvData).subscribe({
      next: (res) => {
        this.csvImporting = false;
        if (res.success) {
          this.csvResult = {
            created: res.created || 0,
            updated: res.updated || 0,
            errors: res.errors || [],
            total: res.total || this.csvData.length
          };
          this.notificationService.success(`${res.created || 0} créé(s), ${res.updated || 0} mis à jour sur ${res.total}`);
          this.loadData();
        } else {
          this.notificationService.error(res.message || 'Erreur import');
        }
      },
      error: (err) => {
        this.csvImporting = false;
        this.notificationService.error(err.error?.message || 'Erreur import CSV');
      }
    });
  }

  removeCsvRow(index: number): void {
    this.csvData.splice(index, 1);
  }

  get csvTotalQuantite(): number {
    return this.csvData.reduce((a, r) => a + r.quantite, 0);
  }

  get csvNbCategories(): number {
    return new Set(this.csvData.map(r => r.categorie)).size;
  }

  resetCsv(): void {
    this.csvData = [];
    this.csvFileName = '';
    this.csvResult = null;
  }

  // === Modal saisie manuelle ===
  openManualModal(): void {
    this.manualForm = { nom: '', categorie: '', prix_achat: null, quantite: null, reference_sku: '' };
    this.manualErrors = {};
    this.showManualModal = true;
  }

  closeManualModal(): void {
    this.showManualModal = false;
    this.manualErrors = {};
  }

  validateManualForm(): boolean {
    this.manualErrors = {};

    // Nom du produit
    const nom = this.manualForm.nom?.trim();
    if (!nom) {
      this.manualErrors['nom'] = 'Le nom du produit est requis';
    } else if (nom.length < 2) {
      this.manualErrors['nom'] = 'Le nom doit contenir au moins 2 caractères';
    } else if (nom.length > 200) {
      this.manualErrors['nom'] = 'Le nom ne doit pas dépasser 200 caractères';
    }

    // Catégorie
    const cat = this.manualForm.categorie?.trim();
    if (!cat) {
      this.manualErrors['categorie'] = 'La catégorie est requise';
    }

    // Prix d'achat (coût)
    if (this.manualForm.prix_achat === null || this.manualForm.prix_achat === undefined) {
      this.manualErrors['prix_achat'] = 'Le prix d\'achat est requis';
    } else if (typeof this.manualForm.prix_achat === 'string') {
      this.manualErrors['prix_achat'] = 'Le prix doit être un nombre valide';
    } else if (isNaN(this.manualForm.prix_achat)) {
      this.manualErrors['prix_achat'] = 'Format invalide : entrez un nombre (ex: 15000)';
    } else if (this.manualForm.prix_achat < 0) {
      this.manualErrors['prix_achat'] = 'Le prix ne peut pas être négatif';
    } else if (this.manualForm.prix_achat === 0) {
      this.manualErrors['prix_achat'] = 'Le prix d\'achat doit être supérieur à 0';
    } else if (!Number.isFinite(this.manualForm.prix_achat)) {
      this.manualErrors['prix_achat'] = 'Valeur invalide';
    }

    // Quantité
    if (this.manualForm.quantite === null || this.manualForm.quantite === undefined) {
      this.manualErrors['quantite'] = 'La quantité est requise';
    } else if (typeof this.manualForm.quantite === 'string') {
      this.manualErrors['quantite'] = 'La quantité doit être un nombre entier';
    } else if (isNaN(this.manualForm.quantite)) {
      this.manualErrors['quantite'] = 'Format invalide : entrez un nombre entier (ex: 50)';
    } else if (!Number.isInteger(this.manualForm.quantite)) {
      this.manualErrors['quantite'] = 'La quantité doit être un nombre entier';
    } else if (this.manualForm.quantite < 0) {
      this.manualErrors['quantite'] = 'La quantité ne peut pas être négative';
    }

    return Object.keys(this.manualErrors).length === 0;
  }

  addManualToCsv(): void {
    if (!this.validateManualForm()) return;

    this.csvData.push({
      nom: this.manualForm.nom.trim(),
      categorie: this.manualForm.categorie.trim(),
      prix_achat: this.manualForm.prix_achat!,
      quantite: this.manualForm.quantite!,
      reference_sku: this.manualForm.reference_sku?.trim() || undefined
    });

    this.notificationService.success(`"${this.manualForm.nom}" ajouté à la liste d'import`);
    // Reset form for next entry
    this.manualForm = { nom: '', categorie: this.manualForm.categorie, prix_achat: null, quantite: null, reference_sku: '' };
    this.manualErrors = {};
  }

  saveManualAndClose(): void {
    if (!this.validateManualForm()) return;
    this.addManualToCsv();
    this.closeManualModal();
  }

  downloadCsvTemplate(): void {
    const headers = 'nom;categorie;prix_achat;quantite;reference_sku\n';
    const samples = [
      '"Fond de teint mat";"Maquillage";"18000";"50";"FDT-001"',
      '"Crème hydratante";"Soins visage";"12000";"30";"CRH-002"',
      '"Mascara waterproof";"Maquillage";"9500";"80";"MSC-003"'
    ].join('\n');
    const content = headers + samples;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_import_stock.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Charts
  initCharts(evolutionData: Array<{ _id: string; quantiteVendue: number; nbCommandes: number }>): void {
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const moisCourant = new Date().getMonth();

    // Construire 6 mois
    const labels: string[] = [];
    const venduData: number[] = [];
    const cmdData: number[] = [];

    const dataMap = new Map<string, { qte: number; cmd: number }>();
    evolutionData.forEach(e => {
      dataMap.set(e._id, { qte: e.quantiteVendue, cmd: e.nbCommandes });
    });

    for (let i = 0; i < 6; i++) {
      const moisIndex = (moisCourant - 5 + i + 12) % 12;
      const annee = new Date().getFullYear();
      const moisKey = `${annee}-${String(moisIndex + 1).padStart(2, '0')}`;
      labels.push(moisNoms[moisIndex]);

      const found = dataMap.get(moisKey);
      venduData.push(found?.qte || 0);
      cmdData.push(found?.cmd || 0);
    }

    this.evolutionChartOptions = {
      chart: {
        type: 'area',
        height: 320,
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 800 }
      },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#ff4d4f', '#1677ff'],
      series: [
        { name: 'Quantités vendues', data: venduData },
        { name: 'Nb commandes', data: cmdData }
      ],
      xaxis: {
        categories: labels,
        labels: { style: { colors: '#8c8c8c' } }
      },
      yaxis: {
        labels: { style: { colors: '#8c8c8c' } }
      },
      grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] }
      },
      dataLabels: { enabled: false },
      tooltip: { theme: 'light' },
      legend: { position: 'top' }
    };

    // Top produits chart
    if (this.topProduits.length > 0) {
      this.topProduitsChartOptions = {
        chart: {
          type: 'bar',
          height: 320,
          toolbar: { show: false },
          background: 'transparent',
          animations: { enabled: true, speed: 800 }
        },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 6, barHeight: '60%' }
        },
        colors: ['#1677ff'],
        series: [{ name: 'Vendus', data: this.topProduits.map(p => p.totalVendu) }],
        xaxis: {
          categories: this.topProduits.map(p => p.nom.length > 20 ? p.nom.substring(0, 20) + '...' : p.nom)
        },
        dataLabels: { enabled: true },
        grid: { borderColor: '#f0f0f0' },
        tooltip: {
          theme: 'light',
          y: { formatter: (val: number) => `${val} unités` }
        }
      };
    }
  }
}

