import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;
  private adminDashboardCacheTtlMs = 30000;
  private adminDashboardMemoryCache = new Map<string, { ts: number; data: any }>();
  private adminDashboardStoragePrefix = 'admin_dashboard_cache::';
  private boutiqueCacheTtlMs = 45000;
  private boutiqueMemoryCache = new Map<string, { ts: number; data: any }>();
  private boutiqueStoragePrefix = 'boutique_cache::';

  constructor(private http: HttpClient) {}

  private normalizeParams(params?: any): any {
    if (!params) return {};
    if (params instanceof HttpParams) {
      const out: any = {};
      for (const key of params.keys()) out[key] = params.getAll(key);
      return out;
    }
    return params;
  }

  private buildCacheKey(endpoint: string, params?: any): string {
    const normalized = this.normalizeParams(params);
    const sorted = Object.keys(normalized || {})
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = normalized[key];
        return acc;
      }, {});
    return `${endpoint}::${JSON.stringify(sorted)}`;
  }

  private getCachedValue(key: string, ttlMs: number): any | null {
    const now = Date.now();
    const memory = this.boutiqueMemoryCache.get(key);
    if (memory && now - memory.ts < ttlMs) return memory.data;

    const storageRaw = sessionStorage.getItem(this.boutiqueStoragePrefix + key);
    if (!storageRaw) return null;
    try {
      const parsed = JSON.parse(storageRaw);
      if (parsed?.ts && parsed?.data && now - parsed.ts < ttlMs) {
        this.boutiqueMemoryCache.set(key, { ts: parsed.ts, data: parsed.data });
        return parsed.data;
      }
    } catch {
      return null;
    }
    return null;
  }

  private setCachedValue(key: string, data: any): void {
    const payload = { ts: Date.now(), data };
    this.boutiqueMemoryCache.set(key, payload);
    sessionStorage.setItem(this.boutiqueStoragePrefix + key, JSON.stringify(payload));
  }

  private cachedGet(endpoint: string, params?: any, ttlMs: number = this.boutiqueCacheTtlMs): Observable<any> {
    const key = this.buildCacheKey(endpoint, params);
    const cached = this.getCachedValue(key, ttlMs);
    if (cached) return of(cached);
    return this.http.get(`${this.baseUrl}${endpoint}`, { params }).pipe(
      tap((res) => {
        if ((res as any)?.success) this.setCachedValue(key, res);
      })
    );
  }

  invalidateBoutiqueCache(): void {
    this.boutiqueMemoryCache.clear();
    const keysToDelete: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.boutiqueStoragePrefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach((k) => sessionStorage.removeItem(k));
  }

  private clearAdminDashboardCache(): void {
    this.adminDashboardMemoryCache.clear();
    const keysToDelete: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.adminDashboardStoragePrefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach((k) => sessionStorage.removeItem(k));
  }

  private invalidateAppCache(): void {
    this.invalidateBoutiqueCache();
    this.clearAdminDashboardCache();
  }

  // === BOUTIQUES ===
  getBoutiques(params?: any): Observable<any> {
    return this.cachedGet('/boutiques', params);
  }

  getBoutiqueById(id: string): Observable<any> {
    return this.cachedGet(`/boutiques/${id}`);
  }

  createBoutique(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/boutiques`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  updateBoutique(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/boutiques/${id}`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  deleteBoutique(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/boutiques/${id}`).pipe(tap(() => this.invalidateAppCache()));
  }

  getMyBoutiques(userId: string): Observable<any> {
    return this.cachedGet(`/boutiques/user/${userId}`);
  }

  // === PRODUITS ===
  getProduits(params?: any): Observable<any> {
    return this.cachedGet('/produits', params);
  }

  getProduitById(id: string): Observable<any> {
    return this.cachedGet(`/produits/${id}`);
  }

  getProduitsByBoutique(boutiqueId: string): Observable<any> {
    return this.cachedGet(`/produits/boutique/${boutiqueId}`);
  }

  getMyProduits(): Observable<any> {
    return this.cachedGet('/produits/me/list');
  }

  createProduit(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/produits`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  updateProduit(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/produits/${id}`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/produits/${id}`).pipe(tap(() => this.invalidateAppCache()));
  }

  // === PANIER ===
  getPanier(): Observable<any> {
    return this.cachedGet('/panier', undefined, 10000);
  }

  addToPanier(produit_id: string, quantite: number = 1): Observable<any> {
    return this.http.post(`${this.baseUrl}/panier/add`, { produit_id, quantite }).pipe(tap(() => this.invalidateAppCache()));
  }

  updatePanierItem(ligneId: string, quantite: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/panier/item/${ligneId}`, { quantite }).pipe(tap(() => this.invalidateAppCache()));
  }

  removePanierItem(ligneId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/panier/item/${ligneId}`).pipe(tap(() => this.invalidateAppCache()));
  }

  clearPanier(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/panier/clear`).pipe(tap(() => this.invalidateAppCache()));
  }

  // === COMMANDES ===
  createCommande(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/commandes`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  getMyCommandes(): Observable<any> {
    return this.cachedGet('/commandes/mes-commandes');
  }

  getCommandesBoutique(): Observable<any> {
    return this.cachedGet('/commandes/boutique');
  }

  getAllCommandes(params?: any): Observable<any> {
    return this.cachedGet('/commandes/all', params);
  }

  getCommandeById(id: string): Observable<any> {
    return this.cachedGet(`/commandes/${id}`);
  }

  updateStatutCommande(id: string, statut: string, raison?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/commandes/${id}/statut`, { statut, raison }).pipe(tap(() => this.invalidateAppCache()));
  }

  // === AVIS ===
  getAvisByProduit(produitId: string): Observable<any> {
    return this.cachedGet(`/avis/produit/${produitId}`);
  }

  getAvisByBoutique(boutiqueId: string): Observable<any> {
    return this.cachedGet(`/avis/boutique/${boutiqueId}`);
  }

  createAvis(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/avis`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  getMyAvis(): Observable<any> {
    return this.http.get(`${this.baseUrl}/avis/mes-avis`);
  }

  repondreAvis(id: string, reponse: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/avis/${id}/repondre`, { reponse_boutique: reponse }).pipe(tap(() => this.invalidateAppCache()));
  }

  // === FAVORIS ===
  getMyFavoris(type?: string): Observable<any> {
    const params: any = {};
    if (type) params.type = type;
    return this.cachedGet('/favoris', params);
  }

  toggleFavori(type: string, produit_id?: string, boutique_id?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/favoris/toggle`, { type, produit_id, boutique_id }).pipe(tap(() => this.invalidateAppCache()));
  }

  checkFavori(type: string, id: string): Observable<any> {
    return this.cachedGet(`/favoris/check/${type}/${id}`, undefined, 10000);
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
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/valider`, {}).pipe(tap(() => this.invalidateAppCache()));
  }

  rejeterBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/rejeter`, {}).pipe(tap(() => this.invalidateAppCache()));
  }

  suspendreBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/suspendre`, {}).pipe(tap(() => this.invalidateAppCache()));
  }

  getBoutiqueDetail(id: string): Observable<any> {
    return this.cachedGet(`/admin/boutiques/${id}/detail`);
  }

  updateEmplacementBoutique(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/emplacement`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  getBoutiqueStats(): Observable<any> {
    return this.cachedGet('/admin/boutique-stats');
  }

  // Admin - Moderation avis
  getAdminAvis(params?: any): Observable<any> {
    return this.cachedGet('/admin/avis', params);
  }

  modererAvis(id: string, approuve: boolean, raison_moderation?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/avis/${id}/moderer`, { approuve, raison_moderation }).pipe(tap(() => this.invalidateAppCache()));
  }

  supprimerAvis(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/avis/${id}`).pipe(tap(() => this.invalidateAppCache()));
  }

  // === EVENEMENTS ===
  getEvenements(params?: any): Observable<any> {
    return this.cachedGet('/evenements', params);
  }

  getEvenementById(id: string): Observable<any> {
    return this.cachedGet(`/evenements/${id}`);
  }

  createEvenement(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/evenements`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  updateEvenement(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/evenements/${id}`, data).pipe(tap(() => this.invalidateAppCache()));
  }

  deleteEvenement(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/evenements/${id}`).pipe(tap(() => this.invalidateAppCache()));
  }

  updateStatutEvenement(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/evenements/${id}/statut`, { statut }).pipe(tap(() => this.invalidateAppCache()));
  }

  getBoutiquesActives(): Observable<any> {
    return this.cachedGet('/evenements/boutiques-actives');
  }

  getStockStats(dateDebut?: string, dateFin?: string): Observable<any> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.cachedGet('/admin/stock-stats', params);
  }

  updateStock(produitId: string, quantite: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/produits/${produitId}`, { stock_quantite: quantite }).pipe(tap(() => this.invalidateAppCache()));
  }

  // === CSV Import prix d'achat (legacy) ===
  importPrixAchat(data: Array<{ nom: string; reference_sku?: string; prix_achat: number }>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/import-prix-achat`, { data }).pipe(tap(() => this.invalidateAppCache()));
  }

  // === Import stock en masse (produit + categorie + cout + quantite) ===
  importStockCsv(data: Array<{ nom: string; categorie: string; prix_achat: number; prix_vente: number; quantite: number; reference_sku?: string }>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/import-stock`, { data }).pipe(tap(() => this.invalidateAppCache()));
  }

  // === Bénéfice Stats ===
  getBeneficeStats(): Observable<any> {
    return this.cachedGet('/admin/benefice-stats');
  }
}
