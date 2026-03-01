// Angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Project import
import { SharedModule } from '../../shared/shared.module';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { LayoutStateService } from '../../shared/service/layout-state.service';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, SharedModule, NavigationComponent, NavBarComponent, RouterModule, BreadcrumbComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayout {
  private layoutState = inject(LayoutStateService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  // public props
  navCollapsed: boolean;
  windowWidth: number;

  // Constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    // Prefetch dashboard stats to reduce perceived wait on first dashboard open.
    if (this.authService.currentUser?.role === 'admin') {
      this.apiService.prefetchAdminDashboard({ period: '30d', groupBy: 'day' });
    }
  }

  get navCollapsedMob(): boolean {
    return this.layoutState.navCollapsedMob();
  }

  // public method
  navMobClick() {
    this.layoutState.toggleNavCollapsedMob();
    if (document.querySelector('app-navigation.pc-sidebar')?.classList.contains('navbar-collapsed')) {
      document.querySelector('app-navigation.pc-sidebar')?.classList.remove('navbar-collapsed');
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  closeMenu() {
    this.layoutState.closeNavCollapsedMob();
  }
}
