import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  success: boolean;
  message?: string;
  url?: string;
  error?: string;
}

export interface UploadMultipleResponse {
  success: boolean;
  message?: string;
  urls?: string[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Convertit un fichier en base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload une image via l'API backend
   * @param file Le fichier image à uploader
   * @param folder Le dossier dans Cloudinary (optionnel)
   * @returns Observable avec l'URL de l'image uploadée
   */
  uploadImage(file: File, folder?: string): Observable<string> {
    return new Observable(observer => {
      this.fileToBase64(file)
        .then(base64 => {
          const payload = {
            file: base64,
            folder: folder || 'boutiques'
          };

          this.http.post<UploadResponse>(`${this.apiUrl}/upload/image`, payload)
            .subscribe({
              next: (response) => {
                if (response.success && response.url) {
                  observer.next(response.url);
                  observer.complete();
                } else {
                  observer.error(new Error(response.message || 'Erreur lors de l\'upload'));
                }
              },
              error: (error) => {
                console.error('Erreur upload:', error);
                observer.error(error);
              }
            });
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Upload multiple images via l'API backend
   * @param files Tableau de fichiers
   * @param folder Le dossier dans Cloudinary (optionnel)
   * @returns Observable avec les URLs des images uploadées
   */
  uploadMultipleImages(files: File[], folder?: string): Observable<string[]> {
    return new Observable(observer => {
      const base64Promises = files.map(file => this.fileToBase64(file));
      
      Promise.all(base64Promises)
        .then(base64Files => {
          const payload = {
            files: base64Files,
            folder: folder || 'boutiques/galerie'
          };

          this.http.post<UploadMultipleResponse>(`${this.apiUrl}/upload/images`, payload)
            .subscribe({
              next: (response) => {
                if (response.success && response.urls) {
                  observer.next(response.urls);
                  observer.complete();
                } else {
                  observer.error(new Error(response.message || 'Erreur lors de l\'upload'));
                }
              },
              error: (error) => {
                console.error('Erreur upload multiple:', error);
                observer.error(error);
              }
            });
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}

