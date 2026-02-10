import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresComponent {
  parametres = {
    nom_centre: '',
    description: '',
    slogan: '',
    adresse: '',
    telephone: '',
    email_contact: '',
    points_par_euro: 10,
    seuil_niveau_argent: 500,
    seuil_niveau_or: 2000,
    seuil_niveau_platine: 5000,
    frais_livraison_defaut: 5.00,
    mode_maintenance: false,
    message_maintenance: ''
  };

  constructor() {
    // TODO: Charger les paramètres depuis l'API
  }

  sauvegarder() {
    // TODO: Sauvegarder les paramètres
    console.log('Sauvegarde des paramètres', this.parametres);
  }
}
