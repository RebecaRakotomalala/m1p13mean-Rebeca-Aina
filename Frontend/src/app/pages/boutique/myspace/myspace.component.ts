// angular import
import { Component, OnInit, inject, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import {
  ExclamationCircleOutline,
  PictureOutline,
  FullscreenOutline,
  CameraOutline,
  UploadOutline,
  StarOutline,
  MailOutline,
  PhoneOutline,
  GlobalOutline,
  FacebookOutline,
  InstagramOutline,
  TwitterOutline,
  VideoCameraOutline,
  CheckCircleOutline,
  DeleteOutline
} from '@ant-design/icons-angular/icons';
import { CardComponent } from '../../../theme/shared/components/card/card.component';
import { BoutiqueService, Boutique } from '../../../services/boutique.service';
import { AuthService } from '../../../services/auth.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-myspace',
  standalone: true,
  imports: [CommonModule, CardComponent, IconDirective],
  templateUrl: './myspace.component.html',
  styleUrls: ['./myspace.component.scss']
})
export class MySpaceComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  private notificationService = inject(NotificationService);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;

  constructor() {
    // Enregistrer les icônes nécessaires
    this.iconService.addIcon(
      ExclamationCircleOutline,
      PictureOutline,
      FullscreenOutline,
      CameraOutline,
      UploadOutline,
      StarOutline,
      MailOutline,
      PhoneOutline,
      GlobalOutline,
      FacebookOutline,
      InstagramOutline,
      TwitterOutline,
      VideoCameraOutline,
      CheckCircleOutline,
      DeleteOutline
    );
  }

  boutique: Boutique | null = null;
  loading = true;
  error: string | null = null;
  
  // États pour les uploads
  uploadingLogo = false;
  uploadingGallery = false;
  uploadProgress = 0;
  
  // Modal pour voir le logo en grand
  showLogoModal = false;

  ngOnInit(): void {
    // Utiliser setTimeout pour éviter l'erreur NG0100
    setTimeout(() => {
      this.loadBoutique();
    }, 0);
  }

  loadBoutique(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      setTimeout(() => {
        this.error = 'Utilisateur non connecté';
        this.loading = false;
        this.cdr.detectChanges();
      }, 0);
      return;
    }

    // Récupérer les boutiques de l'utilisateur connecté
    this.boutiqueService.getBoutiquesByUserId(currentUser.id).subscribe({
      next: (response) => {
        setTimeout(() => {
          if (response.success && response.boutiques && response.boutiques.length > 0) {
            // Prendre la première boutique (ou vous pouvez permettre de sélectionner)
            this.boutique = response.boutiques[0];
            this.error = null;
          } else {
            this.error = 'Aucune boutique trouvée pour cet utilisateur';
            this.boutique = null;
          }
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la boutique:', err);
        setTimeout(() => {
          this.error = 'Erreur lors du chargement des données de la boutique';
          this.loading = false;
          this.boutique = null;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  // Helper pour obtenir le statut avec badge coloré
  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'active': 'badge bg-success',
      'validee': 'badge bg-primary',
      'en_attente': 'badge bg-warning',
      'suspendue': 'badge bg-danger',
      'fermee': 'badge bg-secondary'
    };
    return classes[statut] || 'badge bg-secondary';
  }

  // Helper pour obtenir la classe du plan
  getPlanClass(plan: string): string {
    const classes: { [key: string]: string } = {
      'premium': 'badge bg-primary',
      'vip': 'badge bg-warning',
      'basique': 'badge bg-secondary'
    };
    return classes[plan] || 'badge bg-secondary';
  }

  // Helper pour formater les horaires en tableau
  formatHoraires(horaires: Record<string, { ouverture?: string; fermeture?: string }> | null | undefined): Array<{ jour: string; horaire: string }> {
    if (!horaires || typeof horaires !== 'object') {
      return [];
    }
    
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const joursFr: { [key: string]: string } = {
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };

    return jours
      .filter(jour => horaires[jour])
      .map(jour => {
        const h = horaires[jour];
        return {
          jour: joursFr[jour],
          horaire: `${h.ouverture || 'Fermé'} - ${h.fermeture || 'Fermé'}`
        };
      });
  }

  // Ouvrir l'image en grand (simple pour l'instant)
  openImageModal(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }

  // Upload du logo
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.notificationService.warning('Veuillez sélectionner un fichier image');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.warning('Le fichier est trop volumineux (max 5MB)');
        return;
      }

      this.uploadLogo(file);
    }
  }

  uploadLogo(file: File): void {
    if (!this.boutique || !this.boutique._id) {
      this.notificationService.error('Boutique non trouvée');
      return;
    }

    // Utiliser setTimeout pour éviter l'erreur NG0100
    setTimeout(() => {
      this.uploadingLogo = true;
      this.uploadProgress = 0;
      this.cdr.detectChanges();
    }, 0);

    this.cloudinaryService.uploadImage(file, 'boutiques/logos').subscribe({
      next: (imageUrl) => {
        // Mettre à jour la boutique
        this.boutiqueService.updateBoutique(this.boutique!._id!, {
          logo_url: imageUrl
        }).subscribe({
          next: (updateResponse) => {
            if (updateResponse.success && updateResponse.boutique) {
              this.boutique = updateResponse.boutique;
              this.notificationService.success('Logo mis à jour avec succès!', { duration: 4000 });
            }
            setTimeout(() => {
              this.uploadingLogo = false;
              this.uploadProgress = 0;
              this.cdr.detectChanges();
            }, 0);
            // Réinitialiser l'input
            if (this.logoInput) {
              this.logoInput.nativeElement.value = '';
            }
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du logo:', error);
            this.notificationService.error('Erreur lors de la mise à jour du logo: ' + (error.error?.message || error.message));
            setTimeout(() => {
              this.uploadingLogo = false;
              this.uploadProgress = 0;
              this.cdr.detectChanges();
            }, 0);
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload du logo:', error);
        console.error('Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });
        
        let errorMessage = 'Erreur inconnue lors de l\'upload';
        
        if (error.error) {
          if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Afficher un message plus détaillé
        if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else if (error.status === 400) {
          errorMessage = 'Format de fichier invalide. ' + (error.error?.error || errorMessage);
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur: ' + (error.error?.error || errorMessage);
        }
        
        this.notificationService.error('Erreur lors de l\'upload de l\'image: ' + errorMessage);
        setTimeout(() => {
          this.uploadingLogo = false;
          this.uploadProgress = 0;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  // Upload de photos dans la galerie
  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Vérifier les types de fichiers
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        this.notificationService.warning('Veuillez sélectionner uniquement des fichiers image');
        return;
      }

      // Vérifier la taille (max 5MB par fichier)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        this.notificationService.warning('Certains fichiers sont trop volumineux (max 5MB par fichier)');
        return;
      }

      this.uploadGallery(files);
    }
  }

  uploadGallery(files: File[]): void {
    if (!this.boutique || !this.boutique._id) {
      this.notificationService.error('Boutique non trouvée');
      return;
    }

    // Utiliser setTimeout pour éviter l'erreur NG0100
    setTimeout(() => {
      this.uploadingGallery = true;
      this.uploadProgress = 0;
      this.cdr.detectChanges();
    }, 0);

    this.cloudinaryService.uploadMultipleImages(files, 'boutiques/galerie').subscribe({
      next: (imageUrls) => {
        // Ajouter les nouvelles URLs à la galerie existante
        const currentPhotos = this.boutique!.galerie_photos || [];
        const updatedPhotos = [...currentPhotos, ...imageUrls];

        // Mettre à jour la boutique
        this.boutiqueService.updateBoutique(this.boutique!._id!, {
          galerie_photos: updatedPhotos
        }).subscribe({
          next: (updateResponse) => {
            if (updateResponse.success && updateResponse.boutique) {
              this.boutique = updateResponse.boutique;
              this.notificationService.success(`${imageUrls.length} photo(s) ajoutée(s) avec succès!`, { duration: 4000 });
            }
            setTimeout(() => {
              this.uploadingGallery = false;
              this.uploadProgress = 0;
              this.cdr.detectChanges();
            }, 0);
            // Réinitialiser l'input
            if (this.galleryInput) {
              this.galleryInput.nativeElement.value = '';
            }
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour de la galerie:', error);
            this.notificationService.error('Erreur lors de la mise à jour de la galerie: ' + (error.error?.message || error.message));
            setTimeout(() => {
              this.uploadingGallery = false;
              this.uploadProgress = 0;
              this.cdr.detectChanges();
            }, 0);
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload des photos:', error);
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Erreur inconnue';
        this.notificationService.error('Erreur lors de l\'upload des images: ' + errorMessage);
        setTimeout(() => {
          this.uploadingGallery = false;
          this.uploadProgress = 0;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  // Supprimer une photo de la galerie
  deletePhoto(photoUrl: string, index: number): void {
    if (!this.boutique || !this.boutique._id) {
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      const updatedPhotos = this.boutique.galerie_photos?.filter((_, i) => i !== index) || [];

      this.boutiqueService.updateBoutique(this.boutique._id, {
        galerie_photos: updatedPhotos
      }).subscribe({
        next: (updateResponse) => {
          if (updateResponse.success && updateResponse.boutique) {
            this.boutique = updateResponse.boutique;
            this.notificationService.success('Photo supprimée avec succès!', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la photo:', error);
          this.notificationService.error('Erreur lors de la suppression de la photo');
        }
      });
    }
  }

  // Déclencher le clic sur l'input file
  triggerLogoUpload(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.logoInput) {
      this.logoInput.nativeElement.click();
    }
  }

  // Ouvrir le modal pour voir le logo en grand
  openLogoModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.boutique?.logo_url) {
      this.showLogoModal = true;
    }
  }

  // Fermer le modal
  closeLogoModal(): void {
    this.showLogoModal = false;
  }

  triggerGalleryUpload(): void {
    if (this.galleryInput) {
      this.galleryInput.nativeElement.click();
    }
  }
}