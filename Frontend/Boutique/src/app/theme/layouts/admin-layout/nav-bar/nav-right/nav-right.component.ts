// angular import
import { Component, output, inject, input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService, User } from 'src/app/services/auth.service';

// third party

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule, CommonModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  private iconService = inject(IconService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;

  // public props
  styleSelectorToggle = input<boolean>();
  readonly Customize = output();
  windowWidth: number;
  screenFull: boolean = true;
  direction: string = 'ltr';

  // constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        EditOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  // Obtenir le nom complet de l'utilisateur
  getUserName(): string {
    if (!this.currentUser) return 'Utilisateur';
    const nom = this.currentUser.nom || this.currentUser.name || '';
    const prenom = this.currentUser.prenom || '';
    return `${prenom} ${nom}`.trim() || this.currentUser.email || 'Utilisateur';
  }

  // Obtenir le rôle formaté
  getUserRole(): string {
    if (!this.currentUser) return 'Utilisateur';
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'boutique': 'Boutique',
      'client': 'Client'
    };
    return roleMap[this.currentUser.role] || this.currentUser.role;
  }

  // Obtenir l'avatar
  getUserAvatar(): string {
    if (this.currentUser?.avatar_url) {
      return this.currentUser.avatar_url;
    }
    return 'assets/images/user/avatar-2.jpg';
  }

  // Logout
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Gérer le clic sur les items du menu
  onMenuItemClick(item: any): void {
    if (item.icon === 'logout') {
      this.onLogout();
    }
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile'
    },
    {
      icon: 'user',
      title: 'View Profile'
    },
    {
      icon: 'profile',
      title: 'Social Profile'
    },
    {
      icon: 'wallet',
      title: 'Billing'
    },
    {
      icon: 'logout',
      title: 'Logout'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];
}
