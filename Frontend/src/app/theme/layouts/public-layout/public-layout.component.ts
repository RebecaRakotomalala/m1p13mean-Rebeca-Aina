import { Component, inject, HostListener } from '@angular/core';
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
  isScrolled = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

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

  getUserInitial(): string {
    const user = this.currentUser;
    if (user?.nom) return user.nom.charAt(0).toUpperCase();
    return 'U';
  }

  getRoleLabel(): string {
    const role = this.currentUser?.role;
    if (role === 'admin') return 'Administrateur';
    if (role === 'boutique') return 'Vendeur';
    return 'Client';
  }

  logout(): void {
    this.authService.logout();
  }
}
