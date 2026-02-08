import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Boutique {
  _id?: string;
  utilisateur_id: string | {
    _id: string;
    email: string;
    nom: string;
    prenom?: string;
    role: string;
  };
  nom: string;
  slug: string;
  description_courte?: string;
  description_longue?: string;
  logo_url?: string;
  banniere_url?: string;
  categorie_principale: string;
  categories_secondaires?: string[];
  email_contact?: string;
  telephone_contact?: string;
  site_web?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  numero_emplacement?: string;
  etage?: string;
  zone?: string;
  surface_m2?: number;
  position_x?: number;
  position_y?: number;
  horaires?: any;
  services?: string[];
  galerie_photos?: string[];
  note_moyenne?: number;
  nombre_avis?: number;
  nombre_vues?: number;
  nombre_favoris?: number;
  statut: 'en_attente' | 'validee' | 'active' | 'suspendue' | 'fermee';
  date_validation?: Date;
  validee_par?: string;
  plan: 'basique' | 'premium' | 'vip';
  date_debut_abonnement?: Date;
  date_fin_abonnement?: Date;
  date_creation?: Date;
  date_modification?: Date;
}

export interface BoutiqueResponse {
  success: boolean;
  message?: string;
  boutique?: Boutique;
  boutiques?: Boutique[];
  count?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Obtenir toutes les boutiques
  getAllBoutiques(): Observable<BoutiqueResponse> {
    return this.http.get<BoutiqueResponse>(`${this.apiUrl}/boutiques`);
  }

  // Obtenir une boutique par ID
  getBoutiqueById(id: string): Observable<BoutiqueResponse> {
    return this.http.get<BoutiqueResponse>(`${this.apiUrl}/boutiques/${id}`);
  }

  // Obtenir les boutiques d'un utilisateur spécifique
  getBoutiquesByUserId(userId: string): Observable<BoutiqueResponse> {
    return this.http.get<BoutiqueResponse>(`${this.apiUrl}/boutiques/user/${userId}`);
  }

  // Créer une nouvelle boutique
  createBoutique(boutique: Partial<Boutique>): Observable<BoutiqueResponse> {
    return this.http.post<BoutiqueResponse>(`${this.apiUrl}/boutiques`, boutique);
  }

  // Mettre à jour une boutique
  updateBoutique(id: string, boutique: Partial<Boutique>): Observable<BoutiqueResponse> {
    return this.http.put<BoutiqueResponse>(`${this.apiUrl}/boutiques/${id}`, boutique);
  }

  // Supprimer une boutique
  deleteBoutique(id: string): Observable<BoutiqueResponse> {
    return this.http.delete<BoutiqueResponse>(`${this.apiUrl}/boutiques/${id}`);
  }
}

