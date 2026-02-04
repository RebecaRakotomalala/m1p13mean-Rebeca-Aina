// Angular import
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-auth-register',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss'
})
export class AuthRegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  selectedRole: 'admin' | 'boutique' | 'client' = 'client';
  isAdmin: boolean = false;
  isBoutique: boolean = false;
  isBuyer: boolean = true; // Buyer sélectionné par défaut
  acceptTerms: boolean = false;
  acceptPrivacy: boolean = false;
  loading: boolean = false;
  error: string = '';
  success: string = '';

  SignUpOptions = [
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

  // Gérer la sélection unique des checkboxes
  onRoleChange(role: 'admin' | 'boutique' | 'client'): void {
    // Désélectionner les autres
    this.isAdmin = role === 'admin';
    this.isBoutique = role === 'boutique';
    this.isBuyer = role === 'client';
    this.selectedRole = role;
  }

  onRegister(): void {
    this.error = '';
    this.success = '';
    
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (!this.acceptTerms || !this.acceptPrivacy) {
      this.error = 'Please accept Terms of Service and Privacy Policy';
      return;
    }

    // Déterminer le rôle sélectionné
    if (this.isAdmin) {
      this.selectedRole = 'admin';
    } else if (this.isBoutique) {
      this.selectedRole = 'boutique';
    } else if (this.isBuyer) {
      this.selectedRole = 'client';
    } else {
      this.error = 'Please select an account type (Administrator, Boutique, or Buyer)';
      return;
    }

    this.loading = true;

    this.authService.register({
      name: `${this.firstName} ${this.lastName}`,
      email: this.email,
      password: this.password,
      role: this.selectedRole
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = 'Compte créé avec succès! Redirection vers la page de connexion...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message || 'Erreur lors de l\'inscription';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de l\'inscription. Vérifiez que le backend est démarré.';
        console.error('Erreur register:', error);
      }
    });
  }
}
