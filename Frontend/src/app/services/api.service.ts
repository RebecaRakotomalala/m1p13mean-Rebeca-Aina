import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

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
  getAdminDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/dashboard`);
  }

  validerBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/valider`, {});
  }

  suspendreBoutique(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/boutiques/${id}/suspendre`, {});
  }

  getBoutiqueStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/boutique-stats`);
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
