import { Component, output, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth.service';

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
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  private iconService = inject(IconService);
  public authService = inject(AuthService);

  styleSelectorToggle = input<boolean>();
  readonly Customize = output();
  windowWidth: number;

  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline, GiftOutline, MessageOutline, SettingOutline,
        PhoneOutline, LogoutOutline, EditOutline, UserOutline,
        ProfileOutline, QuestionCircleOutline, LockOutline, CommentOutline,
        UnorderedListOutline, ArrowRightOutline, BellOutline, GithubOutline, WalletOutline
      ]
    );
  }

  get userName(): string {
    const user = this.authService.currentUser;
    return user ? `${user.nom} ${user.prenom || ''}`.trim() : 'Utilisateur';
  }

  get userRole(): string {
    return this.authService.currentUser?.role || '';
  }

  logout(): void {
    this.authService.logout();
  }
}
