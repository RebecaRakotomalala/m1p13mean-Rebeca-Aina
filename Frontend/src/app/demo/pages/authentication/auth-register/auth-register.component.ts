import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-auth-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss'
})
export class AuthRegisterComponent {
  nom = '';
  prenom = '';
  email = '';
  password = '';
  telephone = '';
  role = 'client';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.nom || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caracteres';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.register({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      telephone: this.telephone,
      role: this.role
    }).subscribe({
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
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}
