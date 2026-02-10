import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-liste-boutiques',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent],
  templateUrl: './liste-boutiques.component.html',
  styleUrls: ['./liste-boutiques.component.scss']
})
export class ListeBoutiquesComponent {
  boutiques: any[] = [];
  filtres = {
    statut: '',
    categorie: '',
    plan: '',
    recherche: ''
  };

  constructor() {
    // TODO: Charger les boutiques depuis l'API
  }

  filtrer() {
    // TODO: Implémenter la logique de filtrage
  }

  valider(id: string) {
    // TODO: Valider une boutique
  }

  activer(id: string) {
    // TODO: Activer une boutique
  }

  suspendre(id: string) {
    // TODO: Suspendre une boutique
  }
}
