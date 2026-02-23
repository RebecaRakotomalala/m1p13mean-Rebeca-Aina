import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, CardComponent],
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
      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterRole" (change)="applyFilters()">
            <option value="">Tous les roles</option>
            <option value="admin">Admin</option>
            <option value="boutique">Boutique</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatut" (change)="applyFilters()">
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" placeholder="Rechercher par nom, email..." [(ngModel)]="search" (input)="applyFilters()" />
        </div>
        <div class="col-md-2 text-end">
          <small class="text-muted pt-2 d-block">{{ filteredUsers.length }} resultat(s)</small>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
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
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-sm btn-outline-info" (click)="showUserDetail(u)" title="Detail">
                    <i class="ti ti-eye"></i>
                  </button>
                  <button class="btn btn-sm" [ngClass]="u.actif ? 'btn-warning' : 'btn-success'" (click)="toggleStatus(u._id)"
                    [title]="u.actif ? 'Suspendre' : 'Reactiver'">
                    <i class="ti" [ngClass]="u.actif ? 'ti-ban' : 'ti-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filteredUsers.length === 0" class="text-center text-muted py-4">Aucun utilisateur trouve</div>
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
  `
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  filterRole = '';
  filterStatut = '';
  search = '';
  selectedUser: any = null;
  userStats = { total: 0, admins: 0, boutiques: 0, clients: 0 };

  constructor(private authService: AuthService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    const params: any = {};
    if (this.filterRole) params.role = this.filterRole;
    if (this.search) params.search = this.search;
    this.authService.getAllUsers(params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users = res.users;
          this.userStats = {
            total: this.users.length,
            admins: this.users.filter(u => u.role === 'admin').length,
            boutiques: this.users.filter(u => u.role === 'boutique').length,
            clients: this.users.filter(u => u.role === 'client').length
          };
          this.applyFilters();
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  applyFilters(): void {
    let result = [...this.users];
    if (this.filterRole) {
      result = result.filter(u => u.role === this.filterRole);
    }
    if (this.filterStatut === 'actif') {
      result = result.filter(u => u.actif);
    } else if (this.filterStatut === 'suspendu') {
      result = result.filter(u => !u.actif);
    }
    if (this.search) {
      const s = this.search.toLowerCase();
      result = result.filter(u =>
        (u.nom || '').toLowerCase().includes(s) ||
        (u.prenom || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s)
      );
    }
    this.filteredUsers = result;
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
