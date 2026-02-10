import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrls: ['./liste-utilisateurs.component.scss']
})
export class ListeUtilisateursComponent {
  utilisateurs: any[] = [];
  filtres = {
    role: '',
    statut: '',
    recherche: ''
  };

  constructor() {
    // TODO: Charger les utilisateurs depuis l'API
  }

  filtrer() {
    // TODO: Implémenter la logique de filtrage
  }

  supprimer(id: string) {
    // TODO: Implémenter la suppression
  }

  suspendre(id: string) {
    // TODO: Implémenter la suspension
  }
}
