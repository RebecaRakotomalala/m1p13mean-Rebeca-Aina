import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {
  authService = inject(AuthService);
  menuOpen = false;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get dashboardLink(): string {
    const role = this.currentUser?.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'boutique') return '/boutique/dashboard';
    return '/client/panier';
  }

  logout(): void {
    this.authService.logout();
  }
}
