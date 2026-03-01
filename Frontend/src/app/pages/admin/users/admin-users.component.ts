import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Stats rapides -->
    <div class="row mb-3">
      <div class="col-md-3">
        <div class="card bg-light-primary border-0">
          <div class="card-body py-3 text-center">
            <h4 class="mb-0">{{ userStats.total }}</h4>
            <small class="text-muted">Total utilisateurs</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-light-danger border-0">
          <div class="card-body py-3 text-center">
            <h4 class="mb-0">{{ userStats.admins }}</h4>
            <small class="text-muted">Admins</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-light-success border-0">
          <div class="card-body py-3 text-center">
            <h4 class="mb-0">{{ userStats.boutiques }}</h4>
            <small class="text-muted">Boutiques</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-light-info border-0">
          <div class="card-body py-3 text-center">
            <h4 class="mb-0">{{ userStats.clients }}</h4>
            <small class="text-muted">Clients</small>
          </div>
        </div>
      </div>
    </div>

    <app-card cardTitle="Gestion des Utilisateurs">
      <div class="row g-2 mb-3 align-items-center">
        <div class="col-md-3">
          <select class="form-select admin-filter-control" [(ngModel)]="filterRole" (change)="onFilterChange()">
            <option value="">Tous les roles</option>
            <option value="admin">Admin</option>
            <option value="boutique">Boutique</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select admin-filter-control" [(ngModel)]="filterStatut" (change)="onFilterChange()">
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control admin-filter-control" placeholder="Rechercher par nom, email..." [(ngModel)]="search" (input)="onSearchInput()" />
        </div>
        <div class="col-md-2 text-md-end">
          <small class="text-muted admin-table-meta">{{ total }} resultat(s) - Page {{ page }}/{{ pages }}</small>
        </div>
      </div>
      <div class="table-responsive admin-table-wrapper">
        <table class="table table-hover align-middle admin-table mb-0">
          <thead class="admin-table-head">
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Role</th>
              <th>Statut</th>
              <th>Date inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td colspan="7" class="text-center text-muted py-5">Chargement des utilisateurs...</td>
            </tr>
            <tr *ngIf="!loading && filteredUsers.length === 0">
              <td colspan="7" class="text-center text-muted py-5">Aucun utilisateur trouve</td>
            </tr>
            <tr *ngFor="let u of filteredUsers">
              <td>
                <strong>{{ u.nom }} {{ u.prenom }}</strong>
              </td>
              <td>{{ u.email }}</td>
              <td>{{ u.telephone || '-' }}</td>
              <td><span class="badge" [ngClass]="getRoleClass(u.role)">{{ u.role }}</span></td>
              <td><span class="badge" [ngClass]="u.actif ? 'bg-success' : 'bg-danger'">{{ u.actif ? 'Actif' : 'Suspendu' }}</span></td>
              <td>{{ u.date_creation | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="btn-group btn-group-sm admin-actions">
                  <button class="btn btn-sm btn-outline-info admin-icon-btn" (click)="showUserDetail(u)" title="Detail">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button class="btn btn-sm admin-icon-btn" [ngClass]="u.actif ? 'btn-warning' : 'btn-success'" (click)="toggleStatus(u._id)"
                    [title]="u.actif ? 'Suspendre' : 'Reactiver'">
                    <i class="ti" [ngClass]="u.actif ? 'ti-ban' : 'ti-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-flex justify-content-between align-items-center gap-2 mt-3">
        <small class="text-muted">Affichage: {{ filteredUsers.length }} / {{ total }}</small>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light-secondary text-secondary border">Page {{ page }} / {{ pages }}</span>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page <= 1" (click)="goToPrevPage()">
          Prec.
          </button>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="loading || page >= pages" (click)="goToNextPage()">
          Suiv.
          </button>
        </div>
      </div>
    </app-card>

    <!-- Modal Detail Utilisateur -->
    <div *ngIf="selectedUser" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedUser.nom }} {{ selectedUser.prenom }}</h5>
            <button type="button" class="btn-close" (click)="selectedUser = null"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <div class="avtar avtar-xl rounded-circle bg-light-primary mx-auto mb-2">
                <span class="h3">{{ (selectedUser.nom || '?')[0] }}</span>
              </div>
              <h5 class="mb-0">{{ selectedUser.nom }} {{ selectedUser.prenom }}</h5>
              <span class="badge mt-1" [ngClass]="getRoleClass(selectedUser.role)">{{ selectedUser.role }}</span>
              <span class="badge ms-1" [ngClass]="selectedUser.actif ? 'bg-success' : 'bg-danger'">{{ selectedUser.actif ? 'Actif' : 'Suspendu' }}</span>
            </div>
            <hr>
            <div class="row">
              <div class="col-6 mb-2">
                <small class="text-muted d-block">Email</small>
                <strong>{{ selectedUser.email }}</strong>
              </div>
              <div class="col-6 mb-2">
                <small class="text-muted d-block">Telephone</small>
                <strong>{{ selectedUser.telephone || '-' }}</strong>
              </div>
              <div class="col-6 mb-2">
                <small class="text-muted d-block">Email verifie</small>
                <span class="badge" [ngClass]="selectedUser.email_verifie ? 'bg-success' : 'bg-secondary'">
                  {{ selectedUser.email_verifie ? 'Oui' : 'Non' }}
                </span>
              </div>
              <div class="col-6 mb-2">
                <small class="text-muted d-block">2FA</small>
                <span class="badge" [ngClass]="selectedUser.auth_2fa_active ? 'bg-success' : 'bg-secondary'">
                  {{ selectedUser.auth_2fa_active ? 'Active' : 'Inactif' }}
                </span>
              </div>
              <div class="col-6 mb-2">
                <small class="text-muted d-block">Inscription</small>
                <strong>{{ selectedUser.date_creation | date:'dd/MM/yyyy HH:mm' }}</strong>
              </div>
              <div class="col-6 mb-2">
                <small class="text-muted d-block">Derniere connexion</small>
                <strong>{{ selectedUser.derniere_connexion ? (selectedUser.derniere_connexion | date:'dd/MM/yyyy HH:mm') : 'N/A' }}</strong>
              </div>
            </div>
            <div *ngIf="selectedUser.raison_suspension" class="mt-2 p-2 bg-light-danger rounded">
              <small class="text-danger"><strong>Raison suspension:</strong> {{ selectedUser.raison_suspension }}</small>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm" [ngClass]="selectedUser.actif ? 'btn-warning' : 'btn-success'" (click)="toggleStatus(selectedUser._id); selectedUser = null;">
              {{ selectedUser.actif ? 'Suspendre' : 'Reactiver' }}
            </button>
            <button class="btn btn-secondary" (click)="selectedUser = null">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-filter-control {
      border-radius: 10px;
      min-height: 40px;
      border-color: #dfe3eb;
    }
    .admin-filter-control:focus {
      border-color: #04a9f5;
      box-shadow: 0 0 0 0.2rem rgba(4, 169, 245, 0.15);
    }
    .admin-table-meta {
      display: inline-block;
      padding-top: 10px;
    }
    .admin-table-wrapper {
      border: 1px solid #edf1f7;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
    }
    .admin-table-head th {
      background: #f8f9fc;
      border-bottom: 1px solid #edf1f7;
      font-size: 0.78rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: #5b6b79;
      white-space: nowrap;
    }
    .admin-table tbody tr {
      border-bottom: 1px solid #f1f4f9;
    }
    .admin-table tbody tr:last-child {
      border-bottom: 0;
    }
    .admin-actions .admin-icon-btn {
      border-radius: 8px;
      min-width: 34px;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  filterRole = '';
  filterStatut = '';
  search = '';
  loading = false;
  page = 1;
  pages = 1;
  total = 0;
  private searchTimer: any = null;
  selectedUser: any = null;
  userStats = { total: 0, admins: 0, boutiques: 0, clients: 0 };
  private cdr = inject(ChangeDetectorRef);

  constructor(private authService: AuthService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterRole) params.role = this.filterRole;
    if (this.filterStatut) params.statut = this.filterStatut;
    if (this.search) params.search = this.search;
    params.page = this.page;
    params.limit = 20;
    this.authService.getAllUsers(params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users = res.users || [];
          this.filteredUsers = [...this.users];
          this.page = res.page || 1;
          this.pages = res.pages || 1;
          this.total = res.total || this.users.length;
          if (res.stats) {
            this.userStats = {
              total: res.stats.total || 0,
              admins: res.stats.admins || 0,
              boutiques: res.stats.boutiques || 0,
              clients: res.stats.clients || 0
            };
          }
        }
          this.loading = false;
          this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.loading = false;
          this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadUsers();
  }

  onSearchInput(): void {
    this.page = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadUsers(), 300);
  }

  goToPrevPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.loadUsers();
    }
  }

  goToNextPage(): void {
    if (this.page < this.pages) {
      this.page += 1;
      this.loadUsers();
    }
  }

  toggleStatus(userId: string): void {
    this.authService.toggleUserStatus(userId).subscribe({ next: () => this.loadUsers() });
  }

  showUserDetail(u: any): void {
    this.selectedUser = u;
  }

  getRoleClass(role: string): string {
    return { 'admin': 'bg-danger', 'boutique': 'bg-primary', 'client': 'bg-info' }[role] || 'bg-secondary';
  }
}
