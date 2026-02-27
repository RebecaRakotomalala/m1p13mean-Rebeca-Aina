import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;
  private adminDashboardCacheTtlMs = 30000;
  private adminDashboardMemoryCache = new Map<string, { ts: number; data: any }>();
  private adminDashboardStoragePrefix = 'admin_dashboard_cache::';

  constructor(private http: HttpClient) {}

  // === BOUTIQUES ===
  getBoutiques(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/boutiques`, { params });
  }

  getBoutiqueById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/boutiques/${id}`);
  }

  createBoutique(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/boutiques`, data);
  }

  updateBoutique(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/boutiques/${id}`, data);
  }

  deleteBoutique(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/boutiques/${id}`);
  }

  getMyBoutiques(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/boutiques/user/${userId}`);
  }

  // === PRODUITS ===
  getProduits(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/produits`, { params });
  }

  getProduitById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/produits/${id}`);
  }

  getProduitsByBoutique(boutiqueId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/produits/boutique/${boutiqueId}`);
  }

  getMyProduits(): Observable<any> {
    return this.http.get(`${this.baseUrl}/produits/me/list`);
  }

  createProduit(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/produits`, data);
  }

  updateProduit(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/produits/${id}`, data);
  }

  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/produits/${id}`);
  }

  // === PANIER ===
  getPanier(): Observable<any> {
    return this.http.get(`${this.baseUrl}/panier`);
  }

  addToPanier(produit_id: string, quantite: number = 1): Observable<any> {
    return this.http.post(`${this.baseUrl}/panier/add`, { produit_id, quantite });
  }

  updatePanierItem(ligneId: string, quantite: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/panier/item/${ligneId}`, { quantite });
  }

  removePanierItem(ligneId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/panier/item/${ligneId}`);
  }

  clearPanier(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/panier/clear`);
  }

  // === COMMANDES ===
  createCommande(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/commandes`, data);
  }

  getMyCommandes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/commandes/mes-commandes`);
  }

  getCommandesBoutique(): Observable<any> {
    return this.http.get(`${this.baseUrl}/commandes/boutique`);
  }

  getAllCommandes(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/commandes/all`, { params });
  }

  getCommandeById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/commandes/${id}`);
  }

  updateStatutCommande(id: string, statut: string, raison?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/commandes/${id}/statut`, { statut, raison });
  }

  // === AVIS ===
  getAvisByProduit(produitId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/avis/produit/${produitId}`);
  }

  getAvisByBoutique(boutiqueId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/avis/boutique/${boutiqueId}`);
  }

  createAvis(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/avis`, data);
  }

  getMyAvis(): Observable<any> {
    return this.http.get(`${this.baseUrl}/avis/mes-avis`);
  }

  repondreAvis(id: string, reponse: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/avis/${id}/repondre`, { reponse_boutique: reponse });
  }

  // === FAVORIS ===
  getMyFavoris(type?: string): Observable<any> {
    const params: any = {};
    if (type) params.type = type;
    return this.http.get(`${this.baseUrl}/favoris`, { params });
  }

  toggleFavori(type: string, produit_id?: string, boutique_id?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/favoris/toggle`, { type, produit_id, boutique_id });
  }

  checkFavori(type: string, id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/favoris/check/${type}/${id}`);
  }

  // === ADMIN ===
  private buildDashboardCacheKey(params?: any): string {
    const normalized = Object.keys(params || {})
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = params[key];
        return acc;
      }, {});
    return JSON.stringify(normalized);
  }

  getCachedAdminDashboardData(params?: any): any | null {
    const key = this.buildDashboardCacheKey(params);
    const now = Date.now();

    const memory = this.adminDashboardMemoryCache.get(key);
    if (memory && now - memory.ts < this.adminDashboardCacheTtlMs) {
      return memory.data;
    }

    const storageRaw = sessionStorage.getItem(this.adminDashboardStoragePrefix + key);
    if (!storageRaw) return null;
    try {
      const parsed = JSON.parse(storageRaw);
      if (parsed?.ts && parsed?.data && now - parsed.ts < this.adminDashboardCacheTtlMs) {
        this.adminDashboardMemoryCache.set(key, { ts: parsed.ts, data: parsed.data });
        return parsed.data;
      }
    } catch {
      return null;
    }
    return null;
  }

  private setCachedAdminDashboardData(params: any, data: any): void {
    const key = this.buildDashboardCacheKey(params);
    const payload = { ts: Date.now(), data };
    this.adminDashboardMemoryCache.set(key, payload);
    sessionStorage.setItem(this.adminDashboardStoragePrefix + key, JSON.stringify(payload));
  }

  getAdminDashboard(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/dashboard`, { params }).pipe(
      tap((res) => {
        if ((res as any)?.success) {
          this.setCachedAdminDashboardData(params || {}, res);
        }
      })
    );
  }

  prefetchAdminDashboard(params?: any): void {
    this.getAdminDashboard(params).subscribe({
      error: () => {
        // Silent: prefetch should never block UI
      }
    });
  }

  validerBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/valider`, {});
  }

  rejeterBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/rejeter`, {});
  }

  suspendreBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/suspendre`, {});
  }

  getBoutiqueDetail(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/boutiques/${id}/detail`);
  }

  updateEmplacementBoutique(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/emplacement`, data);
  }

  getBoutiqueStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/boutique-stats`);
  }

  // Admin - Moderation avis
  getAdminAvis(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/avis`, { params });
  }

  modererAvis(id: string, approuve: boolean, raison_moderation?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/avis/${id}/moderer`, { approuve, raison_moderation });
  }

  supprimerAvis(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/avis/${id}`);
  }

  // === EVENEMENTS ===
  getEvenements(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/evenements`, { params });
  }

  getEvenementById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/evenements/${id}`);
  }

  createEvenement(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/evenements`, data);
  }

  updateEvenement(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/evenements/${id}`, data);
  }

  deleteEvenement(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/evenements/${id}`);
  }

  updateStatutEvenement(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/evenements/${id}/statut`, { statut });
  }

  getBoutiquesActives(): Observable<any> {
    return this.http.get(`${this.baseUrl}/evenements/boutiques-actives`);
  }

  getStockStats(dateDebut?: string, dateFin?: string): Observable<any> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get(`${this.baseUrl}/admin/stock-stats`, { params });
  }

  updateStock(produitId: string, quantite: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/produits/${produitId}`, { stock_quantite: quantite });
  }

  // === CSV Import prix d'achat (legacy) ===
  importPrixAchat(data: Array<{ nom: string; reference_sku?: string; prix_achat: number }>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/import-prix-achat`, { data });
  }

  // === Import stock en masse (produit + categorie + cout + quantite) ===
  importStockCsv(data: Array<{ nom: string; categorie: string; prix_achat: number; quantite: number; reference_sku?: string }>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/import-stock`, { data });
  }

  // === Bénéfice Stats ===
  getBeneficeStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/benefice-stats`);
  }
}
