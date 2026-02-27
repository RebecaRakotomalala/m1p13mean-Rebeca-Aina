import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-auth-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  fillTestCredentials(role: 'admin' | 'boutique' | 'client'): void {
    const presets = {
      admin: { email: 'admin@mallconnect.mg', password: 'admin123' },
      boutique: { email: 'cosmetique@boutique.mg', password: 'boutique123' },
      client: { email: 'client@test.mg', password: 'client123' }
    };
    this.email = presets[role].email;
    this.password = presets[role].password;
    this.errorMessage = '';
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const role = res.user.role;
          if (role === 'admin') this.router.navigate(['/admin/dashboard']);
          else if (role === 'boutique') this.router.navigate(['/boutique/dashboard']);
          else this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur de connexion';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
