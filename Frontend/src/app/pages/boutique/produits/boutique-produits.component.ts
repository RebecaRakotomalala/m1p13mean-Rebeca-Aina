import { Component, OnInit, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  SearchOutline,
  AppstoreOutline,
  UnorderedListOutline,
  PlusOutline,
  InboxOutline,
  EyeOutline,
  EditOutline,
  DeleteOutline
} from '@ant-design/icons-angular/icons';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

interface Produit {
  _id?: string;
  boutique_id?: string;
  nom: string;
  categorie: string;
  sous_categorie?: string;
  prix_initial: number;
  prix_promo?: number;
  stock_quantite: number;
  stock_illimite?: boolean;
  description_courte?: string;
  description_longue?: string;
  image_principale?: string;
  nombre_ventes?: number;
  actif?: boolean;
  nouveau?: boolean;
  coup_de_coeur?: boolean;
}

interface Boutique {
  _id: string;
  nom: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-boutique-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, IconDirective],
  templateUrl: './boutique-produits.component.html',
  styleUrls: ['./boutique-produits.component.scss']
})
export class BoutiqueProduitsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cloudinaryService = inject(CloudinaryService);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  constructor() {
    // Enregistrer les icônes nécessaires
    this.iconService.addIcon(
      SearchOutline,
      AppstoreOutline,
      UnorderedListOutline,
      PlusOutline,
      InboxOutline,
      EyeOutline,
      EditOutline,
      DeleteOutline
    );
  }

  produits: Produit[] = [];
  produitsFiltres: Produit[] = [];
  boutiques: Boutique[] = [];
  showForm = false;
  editingProduit: Produit | null = null;
  loading = false;
  uploadingImage = false;
  errorMessage = '';
  
  // Recherche et filtres
  searchTerm = '';
  filterCategorie = '';
  filterStock = 'all'; // all, low, in_stock, out_of_stock
  filterActif = 'all'; // all, active, inactive
  viewMode: 'grid' | 'table' = 'grid';
  
  // Modal détails
  selectedProduit: Produit | null = null;
  showDetailsModal = false;
  
  // Catégories uniques pour le filtre
  categories: string[] = [];

  form: Partial<Produit> = {
    nom: '',
    categorie: '',
    sous_categorie: '',
    prix_initial: 0,
    prix_promo: undefined,
    stock_quantite: 0,
    stock_illimite: false,
    description_courte: '',
    description_longue: '',
    image_principale: '',
    actif: true,
    nouveau: false,
    coup_de_coeur: false
  };

  ngOnInit(): void {
    this.loadProduits();
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    const userId = this.auth.currentUser?.id;
    if (userId) {
      this.api.getMyBoutiques(userId).subscribe({
        next: (res) => {
          if (res.success) {
            this.boutiques = res.boutiques || [];
          }
        },
        error: (err) => console.error('Erreur chargement boutiques:', err)
      });
    }
  }

  loadProduits(): void {
    this.loading = true;
    this.api.getMyProduits().subscribe({
      next: (res) => {
        if (res.success) {
          this.produits = res.produits || [];
          this.extractCategories();
          this.applyFilters();
          this.notificationService.success(`${this.produits.length} produit(s) chargé(s)`);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.notificationService.error('Erreur lors du chargement des produits');
        this.loading = false;
      }
    });
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.produits.forEach(p => {
      if (p.categorie) cats.add(p.categorie);
    });
    this.categories = Array.from(cats).sort();
  }

  applyFilters(): void {
    let filtered = [...this.produits];

    // Recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom?.toLowerCase().includes(term) ||
        p.categorie?.toLowerCase().includes(term) ||
        p.description_courte?.toLowerCase().includes(term)
      );
    }

    // Filtre catégorie
    if (this.filterCategorie) {
      filtered = filtered.filter(p => p.categorie === this.filterCategorie);
    }

    // Filtre stock
    if (this.filterStock === 'low') {
      filtered = filtered.filter(p => !p.stock_illimite && p.stock_quantite < 5 && p.stock_quantite > 0);
    } else if (this.filterStock === 'out_of_stock') {
      filtered = filtered.filter(p => !p.stock_illimite && p.stock_quantite === 0);
    } else if (this.filterStock === 'in_stock') {
      filtered = filtered.filter(p => p.stock_illimite || p.stock_quantite > 0);
    }

    // Filtre actif
    if (this.filterActif === 'active') {
      filtered = filtered.filter(p => p.actif !== false);
    } else if (this.filterActif === 'inactive') {
      filtered = filtered.filter(p => p.actif === false);
    }

    this.produitsFiltres = filtered;
  }

  resetForm(): void {
    this.editingProduit = null;
    this.errorMessage = '';
    this.form = {
      nom: '',
      categorie: '',
      sous_categorie: '',
      prix_initial: 0,
      prix_promo: undefined,
      stock_quantite: 0,
      stock_illimite: false,
      description_courte: '',
      description_longue: '',
      image_principale: '',
      actif: true,
      nouveau: false,
      coup_de_coeur: false
    };
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  }

  editProduit(p: Produit): void {
    this.editingProduit = p;
    this.showForm = true;
    this.form = { ...p };
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.notificationService.warning('Veuillez sélectionner un fichier image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.warning('Le fichier est trop volumineux (max 5MB)');
        return;
      }

      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.uploadingImage = true;
    this.cloudinaryService.uploadImage(file, 'produits').subscribe({
      next: (imageUrl) => {
        this.form.image_principale = imageUrl;
        this.uploadingImage = false;
        this.notificationService.success('Image uploadée avec succès!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur upload image:', error);
        this.notificationService.error('Erreur lors de l\'upload de l\'image');
        this.uploadingImage = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveProduit(): void {
    if (!this.form.nom || !this.form.categorie || !this.form.prix_initial) {
      this.errorMessage = 'Nom, catégorie et prix sont requis';
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.form.prix_initial <= 0) {
      this.errorMessage = 'Le prix doit être supérieur à 0';
      this.notificationService.warning('Le prix doit être supérieur à 0');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.editingProduit) {
      // Mise à jour
      this.api.updateProduit(this.editingProduit._id!, this.form).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.loadProduits();
          this.notificationService.success('Produit modifié avec succès!');
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la modification';
          this.notificationService.error(this.errorMessage);
        }
      });
    } else {
      // Création
      if (this.boutiques.length > 0) {
        this.form.boutique_id = this.boutiques[0]._id;
      } else {
        this.notificationService.error('Aucune boutique trouvée. Veuillez créer une boutique d\'abord.');
        this.loading = false;
        return;
      }

      this.api.createProduit(this.form).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.loadProduits();
          this.notificationService.success('Produit créé avec succès!');
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
          this.notificationService.error(this.errorMessage);
        }
      });
    }
  }

  deleteProduit(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.api.deleteProduit(id).subscribe({
        next: () => {
          this.loadProduits();
          this.notificationService.success('Produit supprimé avec succès!');
        },
        error: (error) => {
          this.notificationService.error('Erreur lors de la suppression: ' + (error.error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  viewDetails(produit: Produit): void {
    this.selectedProduit = produit;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProduit = null;
  }

  toggleActif(produit: Produit): void {
    const newActif = !produit.actif;
    this.api.updateProduit(produit._id!, { actif: newActif }).subscribe({
      next: () => {
        produit.actif = newActif;
        this.applyFilters();
        this.notificationService.success(`Produit ${newActif ? 'activé' : 'désactivé'} avec succès!`);
      },
      error: () => {
        this.notificationService.error('Erreur lors de la modification du statut');
      }
    });
  }

  getStockClass(produit: Produit): string {
    if (produit.stock_illimite) return 'text-success';
    if (produit.stock_quantite === 0) return 'text-danger fw-bold';
    if (produit.stock_quantite < 5) return 'text-warning fw-bold';
    return 'text-success';
  }

  getStockText(produit: Produit): string {
    if (produit.stock_illimite) return 'Illimité';
    return produit.stock_quantite.toString();
  }
}
