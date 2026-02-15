// Angular import
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem, AdminNavigationItems, BoutiqueNavigationItems, ClientNavigationItems } from '../navigation';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

import { NavGroupComponent } from './nav-group/nav-group.component';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  DashboardOutline,
  CreditCardOutline,
  LoginOutline,
  QuestionOutline,
  ChromeOutline,
  FontSizeOutline,
  ProfileOutline,
  BgColorsOutline,
  AntDesignOutline,
  AppstoreOutline,
  ShoppingCartOutline,
  HeartOutline,
  TeamOutline,
  ShopOutline,
  FileDoneOutline,
  HistoryOutline
} from '@ant-design/icons-angular/icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-nav-content',
  imports: [CommonModule, RouterModule, NavGroupComponent, NgScrollbarModule],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private iconService = inject(IconService);
  private authService = inject(AuthService);

  // public props
  NavCollapsedMob = output();

  navigations: NavigationItem[];

  // version
  title = 'MallConnect';
  currentApplicationVersion = environment.appVersion;

  navigation: NavigationItem[] = [];
  windowWidth = window.innerWidth;

  // Constructor
  constructor() {
    this.iconService.addIcon(
      ...[
        DashboardOutline,
        CreditCardOutline,
        FontSizeOutline,
        LoginOutline,
        ProfileOutline,
        BgColorsOutline,
        AntDesignOutline,
        ChromeOutline,
        QuestionOutline,
        AppstoreOutline,
        ShoppingCartOutline,
        HeartOutline,
        TeamOutline,
        ShopOutline,
        FileDoneOutline,
        HistoryOutline
      ]
    );

    // Set navigation based on user role
    const user = this.authService.currentUser;
    if (user) {
      switch (user.role) {
        case 'admin':
          this.navigation = AdminNavigationItems;
          break;
        case 'boutique':
          this.navigation = BoutiqueNavigationItems;
          break;
        case 'client':
          this.navigation = ClientNavigationItems;
          break;
        default:
          this.navigation = ClientNavigationItems;
      }
    } else {
      this.navigation = ClientNavigationItems;
    }
    this.navigations = this.navigation;
  }

  // Life cycle events
  ngOnInit() {
    if (this.windowWidth < 1025) {
      (document.querySelector('.coded-navbar') as HTMLDivElement)?.classList.add('menupos-static');
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 1025 && document.querySelector('app-navigation.coded-navbar')?.classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
