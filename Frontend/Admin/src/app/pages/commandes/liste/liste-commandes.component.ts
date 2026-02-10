import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-liste-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent],
  templateUrl: './liste-commandes.component.html',
  styleUrls: ['./liste-commandes.component.scss']
})
export class ListeCommandesComponent {
  commandes: any[] = [];
  filtres = {
    statut: '',
    boutique: '',
    date_debut: '',
    date_fin: '',
    recherche: ''
  };

  constructor() {
    // TODO: Charger les commandes depuis l'API
  }

  filtrer() {
    // TODO: Implémenter la logique de filtrage
  }

  changerStatut(id: string, nouveauStatut: string) {
    // TODO: Changer le statut d'une commande
  }
}
