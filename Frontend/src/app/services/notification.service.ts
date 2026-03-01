import { Injectable, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  duration?: number; // Durée en millisecondes (défaut: 3000)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; // Position (défaut: top-right)
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private sanitizer = inject(DomSanitizer);
  private containerId = 'notification-container';

  /**
   * Affiche une notification de succès
   */
  success(message: string, options?: NotificationOptions): void {
    this.showNotification(message, 'success', options);
  }

  /**
   * Affiche une notification d'erreur
   */
  error(message: string, options?: NotificationOptions): void {
    this.showNotification(message, 'error', options);
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(message: string, options?: NotificationOptions): void {
    this.showNotification(message, 'warning', options);
  }

  /**
   * Affiche une notification d'information
   */
  info(message: string, options?: NotificationOptions): void {
    this.showNotification(message, 'info', options);
  }

  /**
   * Affiche une notification
   */
  private showNotification(message: string, type: NotificationType, options?: NotificationOptions): void {
    // Créer le conteneur s'il n'existe pas
    this.createContainer(options?.position || 'top-right');

    // Créer la notification
    const notification = this.createNotificationElement(message, type, options?.duration || 3000);

      // Ajouter au conteneur
      const container = document.getElementById(this.containerId);
      if (container) {
        container.appendChild(notification);

        // Initialiser le toast Bootstrap (méthode compatible)
        const initToast = () => {
          const Bootstrap = (window as any).bootstrap;
          if (Bootstrap && Bootstrap.Toast) {
            const bsToast = new Bootstrap.Toast(notification, {
              autohide: true,
              delay: options?.duration || 3000
            });

            bsToast.show();

            // Supprimer l'élément après la fermeture
            notification.addEventListener('hidden.bs.toast', () => {
              notification.remove();
            });
          } else {
            // Fallback si Bootstrap n'est pas disponible
            notification.classList.add('show');
            setTimeout(() => {
              notification.classList.remove('show');
              setTimeout(() => notification.remove(), 300);
            }, options?.duration || 3000);
          }
        };

        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initToast);
        } else {
          // Utiliser un petit délai pour s'assurer que Bootstrap est chargé
          setTimeout(initToast, 100);
        }
      }
  }

  /**
   * Crée le conteneur pour les notifications
   */
  private createContainer(position: string): void {
    if (document.getElementById(this.containerId)) {
      return;
    }

    const container = document.createElement('div');
    container.id = this.containerId;
    container.className = `toast-container position-fixed p-3 ${this.getPositionClass(position)}`;
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  /**
   * Obtient la classe CSS pour la position
   */
  private getPositionClass(position: string): string {
    const positions: { [key: string]: string } = {
      'top-right': 'top-0 end-0',
      'top-left': 'top-0 start-0',
      'bottom-right': 'bottom-0 end-0',
      'bottom-left': 'bottom-0 start-0'
    };
    return positions[position] || positions['top-right'];
  }

  /**
   * Crée l'élément de notification
   */
  private createNotificationElement(message: string, type: NotificationType, duration: number): HTMLElement {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    // Classe selon le type
    const bgClass = this.getBackgroundClass(type);
    toast.classList.add(bgClass);

    // Contenu - Utiliser des symboles Unicode pour les icônes (plus simple que antIcon dans du HTML dynamique)
    const iconSvg = this.getIconSvg(type);
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center">
          <span class="me-2" style="font-size: 1.2rem; display: inline-flex; align-items: center;">${iconSvg}</span>
          <span>${this.sanitizeMessage(message)}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    return toast;
  }

  /**
   * Obtient la classe de fond selon le type
   */
  private getBackgroundClass(type: NotificationType): string {
    const classes: { [key: string]: string } = {
      'success': 'bg-success',
      'error': 'bg-danger',
      'warning': 'bg-warning',
      'info': 'bg-info'
    };
    return classes[type] || classes['info'];
  }

  /**
   * Obtient l'icône selon le type (retourne le nom pour antIcon)
   */
  private getIcon(type: NotificationType): string {
    const icons: { [key: string]: string } = {
      'success': 'check-circle',
      'error': 'exclamation-circle',
      'warning': 'exclamation-triangle',
      'info': 'info-circle'
    };
    return icons[type] || icons['info'];
  }

  /**
   * Obtient le SVG de l'icône selon le type (pour HTML dynamique)
   */
  private getIconSvg(type: NotificationType): string {
    // Utiliser des icônes Unicode simples ou des emojis comme fallback
    const icons: { [key: string]: string } = {
      'success': '✓',
      'error': '✕',
      'warning': '⚠',
      'info': 'ℹ'
    };
    return icons[type] || icons['info'];
  }

  /**
   * Nettoie le message pour éviter les injections XSS
   */
  private sanitizeMessage(message: string): string {
    // Remplacer les sauts de ligne par <br>
    return message.replace(/\n/g, '<br>');
  }
}

