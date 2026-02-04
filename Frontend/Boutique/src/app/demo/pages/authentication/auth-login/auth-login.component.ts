// project import
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-auth-login',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  SignInOptions = [
    {
      image: 'assets/images/authentication/google.svg',
      name: 'Google'
    },
    {
      image: 'assets/images/authentication/twitter.svg',
      name: 'Twitter'
    },
    {
      image: 'assets/images/authentication/facebook.svg',
      name: 'Facebook'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.error = '';
    this.success = '';
    
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.user) {
          // Vérifier que l'utilisateur a le rôle boutique
          if (response.user.role !== 'boutique') {
            this.error = 'Accès refusé. Cette interface est réservée aux Boutiques.';
            this.authService.logout();
            return;
          }
          this.success = 'Connexion réussie! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/dashboard/default']);
          }, 1000);
        } else {
          this.error = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur de connexion. Vérifiez que le backend est démarré.';
        console.error('Erreur login:', error);
      }
    });
  }
}
