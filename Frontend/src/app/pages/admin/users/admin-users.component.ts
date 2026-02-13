import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CardComponent } from '../../../theme/shared/components/card/card.component';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <app-card cardTitle="Gestion des Utilisateurs">
      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterRole" (change)="loadUsers()">
            <option value="">Tous les roles</option>
            <option value="admin">Admin</option>
            <option value="boutique">Boutique</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" placeholder="Rechercher..." [(ngModel)]="search" (input)="loadUsers()" />
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Role</th>
              <th>Statut</th>
              <th>Date inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.nom }} {{ u.prenom }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge" [ngClass]="getRoleClass(u.role)">{{ u.role }}</span></td>
              <td><span class="badge" [ngClass]="u.actif ? 'bg-success' : 'bg-danger'">{{ u.actif ? 'Actif' : 'Suspendu' }}</span></td>
              <td>{{ u.date_creation | date:'dd/MM/yyyy' }}</td>
              <td>
                <button class="btn btn-sm" [ngClass]="u.actif ? 'btn-warning' : 'btn-success'" (click)="toggleStatus(u._id)">
                  {{ u.actif ? 'Suspendre' : 'Reactiver' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="users.length === 0" class="text-center text-muted py-4">Aucun utilisateur trouve</div>
      </div>
    </app-card>
  `
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filterRole = '';
  search = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    const params: any = {};
    if (this.filterRole) params.role = this.filterRole;
    if (this.search) params.search = this.search;
    this.authService.getAllUsers(params).subscribe({
      next: (res: any) => { if (res.success) this.users = res.users; },
      error: (err: any) => console.error(err)
    });
  }

  toggleStatus(userId: string): void {
    this.authService.toggleUserStatus(userId).subscribe({ next: () => this.loadUsers() });
  }

  getRoleClass(role: string): string {
    return { 'admin': 'bg-danger', 'boutique': 'bg-primary', 'client': 'bg-info' }[role] || 'bg-secondary';
  }
}
