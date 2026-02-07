-- ============================================================================
-- SCHÉMA DE BASE DE DONNÉES - MALLCONNECT
-- ============================================================================
-- Base de données : MongoDB (NoSQL)
-- Note : Ce fichier utilise une syntaxe SQL pour la clarté, mais sera 
--        implémenté en MongoDB avec des collections et documents JSON
-- ============================================================================

-- ============================================================================
-- COLLECTIONS PRINCIPALES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Collection : utilisateurs
-- Description : Tous les utilisateurs de la plateforme (Admin, Boutiques, Clients)
-- ----------------------------------------------------------------------------
CREATE TABLE utilisateurs (
    _id                     ObjectId PRIMARY KEY,
    email                   VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash       VARCHAR(255) NOT NULL,
    role                    ENUM('admin', 'boutique', 'client') NOT NULL,
    nom                     VARCHAR(100) NOT NULL,
    prenom                  VARCHAR(100),
    telephone               VARCHAR(20),
    avatar_url              VARCHAR(500),
    
    -- Authentification
    email_verifie           BOOLEAN DEFAULT false,
    telephone_verifie       BOOLEAN DEFAULT false,
    auth_2fa_active         BOOLEAN DEFAULT false,
    auth_2fa_secret         VARCHAR(255),
    derniere_connexion      TIMESTAMP,
    
    -- Réinitialisation mot de passe
    token_reset_mdp         VARCHAR(255),
    token_reset_mdp_expire  TIMESTAMP,
    
    -- Vérification email
    token_verification      VARCHAR(255),
    token_verification_expire TIMESTAMP,
    
    -- OAuth
    google_id               VARCHAR(255),
    facebook_id             VARCHAR(255),
    apple_id                VARCHAR(255),
    
    -- Statut
    actif                   BOOLEAN DEFAULT true,
    date_suspension         TIMESTAMP,
    raison_suspension       TEXT,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_actif (actif)
);

-- ----------------------------------------------------------------------------
-- Collection : boutiques
-- Description : Informations détaillées des boutiques du centre commercial
-- ----------------------------------------------------------------------------
{
  utilisateur_id: ObjectId("..."),   // propriétaire de la boutique

  // Identité visible
  nom: "Boutique Tech Tana",
  slug: "boutique-tech-tana",
  description_courte: "Vente de matériel high-tech",
  logo_url: "https://logo.jpg",
  banniere_url: "https://banniere.jpg",

  // Catégories
  categorie_principale: "Electronique",
  categories_secondaires: ["Audio", "Accessoires"],

  // Contact
  email_contact: "contact@boutique.com",
  telephone_contact: "0340000000",
  site_web: "https://boutique.com",

  // Réseaux sociaux
  facebook_url: "https://facebook.com/...",
  instagram_url: "https://instagram.com/...",

  // Services (ça tu gardes — c’est propre ✅)
  services: [
    "livraison",
    "click_and_collect",
    "paiement_cb"
  ],

  // Galerie photos
  galerie_photos: [
    "https://photo1.jpg",
    "https://photo2.jpg"
  ],

  // Statistiques (ça tu gardes aussi)
  note_moyenne: 0,
  nombre_avis: 0,
  nombre_vues: 0,
  nombre_favoris: 0,

  // Statut
  statut: "en_attente",   // ou "active"
  plan: "basique",

  date_creation: new Date(),
  date_modification: new Date()
}

-- ----------------------------------------------------------------------------
-- Collection : produits
-- Description : Catalogue des produits de toutes les boutiques
-- ----------------------------------------------------------------------------
CREATE TABLE produits (
    _id                     ObjectId PRIMARY KEY,
    boutique_id             ObjectId NOT NULL REFERENCES boutiques(_id),
    
    -- Informations produit
    nom                     VARCHAR(200) NOT NULL,
    slug                    VARCHAR(200) NOT NULL,
    reference_sku           VARCHAR(100),
    description_courte      VARCHAR(500),
    description_longue      TEXT,
    
    -- Catégorisation
    categorie               VARCHAR(100) NOT NULL,
    sous_categorie          VARCHAR(100),
    tags                    JSON, -- Array de tags pour recherche
    
    -- Prix
    prix_initial            DECIMAL(10,2) NOT NULL,
    prix_promo              DECIMAL(10,2),
    pourcentage_reduction   DECIMAL(5,2),
    date_debut_promo        TIMESTAMP,
    date_fin_promo          TIMESTAMP,
    
    -- Stock
    stock_quantite          INT DEFAULT 0,
    stock_seuil_alerte      INT DEFAULT 5,
    stock_illimite          BOOLEAN DEFAULT false,
    
    -- Variations (tailles, couleurs, etc.)
    variations              JSON, -- [{nom: "Taille", valeurs: ["S", "M", "L"]}, ...]
    variants                JSON, -- [{sku: "PROD-001-S-RED", taille: "S", couleur: "Rouge", prix: 29.99, stock: 10}, ...]
    
    -- Images
    image_principale        VARCHAR(500),
    images_secondaires      JSON, -- Array d'URLs
    
    -- Caractéristiques
    caracteristiques        JSON, -- {marque: "Nike", matiere: "Coton", poids: "200g", ...}
    
    -- Dimension et poids (pour livraison)
    poids_kg                DECIMAL(10,3),
    longueur_cm             DECIMAL(10,2),
    largeur_cm              DECIMAL(10,2),
    hauteur_cm              DECIMAL(10,2),
    
    -- Statistiques
    note_moyenne            DECIMAL(3,2) DEFAULT 0.00,
    nombre_avis             INT DEFAULT 0,
    nombre_vues             INT DEFAULT 0,
    nombre_ventes           INT DEFAULT 0,
    nombre_favoris          INT DEFAULT 0,
    
    -- SEO
    meta_titre              VARCHAR(200),
    meta_description        VARCHAR(500),
    
    -- Statut
    actif                   BOOLEAN DEFAULT true,
    epuise                  BOOLEAN DEFAULT false,
    nouveau                 BOOLEAN DEFAULT true,
    coup_de_coeur           BOOLEAN DEFAULT false,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_boutique (boutique_id),
    INDEX idx_slug (slug),
    INDEX idx_categorie (categorie),
    INDEX idx_prix (prix_initial),
    INDEX idx_stock (stock_quantite),
    INDEX idx_actif (actif),
    FULLTEXT idx_recherche (nom, description_courte, description_longue, tags)
);

-- ----------------------------------------------------------------------------
-- Collection : commandes
-- Description : Toutes les commandes passées sur la plateforme
-- ----------------------------------------------------------------------------
CREATE TABLE commandes (
    _id                     ObjectId PRIMARY KEY,
    numero_commande         VARCHAR(50) UNIQUE NOT NULL,
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Informations client
    client_nom              VARCHAR(100),
    client_email            VARCHAR(255),
    client_telephone        VARCHAR(20),
    
    -- Adresse de livraison
    adresse_livraison       JSON, -- {rue, code_postal, ville, pays, complement}
    
    -- Adresse de facturation
    adresse_facturation     JSON,
    
    -- Détails commande
    sous_total              DECIMAL(10,2) NOT NULL,
    frais_livraison         DECIMAL(10,2) DEFAULT 0.00,
    taxes                   DECIMAL(10,2) DEFAULT 0.00,
    reduction_code_promo    DECIMAL(10,2) DEFAULT 0.00,
    reduction_points        DECIMAL(10,2) DEFAULT 0.00,
    montant_total           DECIMAL(10,2) NOT NULL,
    
    -- Code promo utilisé
    code_promo_id           ObjectId REFERENCES codes_promo(_id),
    code_promo_code         VARCHAR(50),
    
    -- Points fidélité
    points_utilises         INT DEFAULT 0,
    points_gagnes           INT DEFAULT 0,
    
    -- Paiement
    methode_paiement        ENUM('carte_credit', 'paypal', 'wallet', 'especes', 'paiement_fractionne'),
    statut_paiement         ENUM('en_attente', 'paye', 'echoue', 'rembourse') DEFAULT 'en_attente',
    transaction_id          VARCHAR(255),
    date_paiement           TIMESTAMP,
    
    -- Mode de livraison
    mode_livraison          ENUM('retrait_boutique', 'livraison_domicile', 'consigne_automatique'),
    
    -- Statut global de la commande
    statut                  ENUM('en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee', 'remboursee') DEFAULT 'en_attente',
    
    -- Notes et instructions
    note_client             TEXT,
    note_interne            TEXT,
    
    -- Suivi
    date_confirmation       TIMESTAMP,
    date_preparation        TIMESTAMP,
    date_prete              TIMESTAMP,
    date_livraison          TIMESTAMP,
    date_annulation         TIMESTAMP,
    raison_annulation       TEXT,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_numero (numero_commande),
    INDEX idx_statut (statut),
    INDEX idx_date_creation (date_creation)
);

-- ----------------------------------------------------------------------------
-- Collection : lignes_commandes
-- Description : Détails des produits commandés (items dans chaque commande)
-- ----------------------------------------------------------------------------
CREATE TABLE lignes_commandes (
    _id                     ObjectId PRIMARY KEY,
    commande_id             ObjectId NOT NULL REFERENCES commandes(_id),
    boutique_id             ObjectId NOT NULL REFERENCES boutiques(_id),
    produit_id              ObjectId NOT NULL REFERENCES produits(_id),
    
    -- Informations produit au moment de la commande
    nom_produit             VARCHAR(200),
    reference_sku           VARCHAR(100),
    image_produit           VARCHAR(500),
    
    -- Variation choisie
    variation_selectionnee  JSON, -- {taille: "M", couleur: "Bleu"}
    
    -- Prix et quantité
    prix_unitaire           DECIMAL(10,2) NOT NULL,
    quantite                INT NOT NULL,
    prix_total              DECIMAL(10,2) NOT NULL,
    
    -- Statut spécifique à cette ligne
    statut                  ENUM('en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'annulee') DEFAULT 'en_attente',
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_commande (commande_id),
    INDEX idx_boutique (boutique_id),
    INDEX idx_produit (produit_id)
);

-- ----------------------------------------------------------------------------
-- Collection : avis
-- Description : Avis et notations des clients sur les produits et boutiques
-- ----------------------------------------------------------------------------
CREATE TABLE avis (
    _id                     ObjectId PRIMARY KEY,
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Type d'avis
    type                    ENUM('produit', 'boutique') NOT NULL,
    produit_id              ObjectId REFERENCES produits(_id),
    boutique_id             ObjectId REFERENCES boutiques(_id),
    
    -- Contenu de l'avis
    note                    INT NOT NULL CHECK (note >= 1 AND note <= 5),
    titre                   VARCHAR(200),
    commentaire             TEXT,
    
    -- Photos jointes
    photos                  JSON, -- Array d'URLs
    
    -- Informations achat
    achat_verifie           BOOLEAN DEFAULT false,
    commande_id             ObjectId REFERENCES commandes(_id),
    
    -- Utilité de l'avis
    nombre_utile            INT DEFAULT 0,
    nombre_non_utile        INT DEFAULT 0,
    
    -- Réponse de la boutique
    reponse_boutique        TEXT,
    date_reponse            TIMESTAMP,
    
    -- Modération
    signale                 BOOLEAN DEFAULT false,
    nombre_signalements     INT DEFAULT 0,
    approuve                BOOLEAN DEFAULT true,
    modere_par              ObjectId REFERENCES utilisateurs(_id),
    raison_moderation       TEXT,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_produit (produit_id),
    INDEX idx_boutique (boutique_id),
    INDEX idx_note (note),
    INDEX idx_date (date_creation)
);

-- ----------------------------------------------------------------------------
-- Collection : favoris
-- Description : Produits et boutiques mis en favoris par les clients
-- ----------------------------------------------------------------------------
CREATE TABLE favoris (
    _id                     ObjectId PRIMARY KEY,
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Type de favori
    type                    ENUM('produit', 'boutique') NOT NULL,
    produit_id              ObjectId REFERENCES produits(_id),
    boutique_id             ObjectId REFERENCES boutiques(_id),
    
    -- Notes personnelles
    note_personnelle        TEXT,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_produit (produit_id),
    INDEX idx_boutique (boutique_id),
    UNIQUE idx_unique_favori (client_id, type, produit_id, boutique_id)
);

-- ----------------------------------------------------------------------------
-- Collection : paniers
-- Description : Paniers d'achat actifs des clients
-- ----------------------------------------------------------------------------
CREATE TABLE paniers (
    _id                     ObjectId PRIMARY KEY,
    client_id               ObjectId REFERENCES utilisateurs(_id),
    session_id              VARCHAR(255), -- Pour les utilisateurs non connectés
    
    -- Statut
    statut                  ENUM('actif', 'abandonne', 'converti') DEFAULT 'actif',
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_abandon            TIMESTAMP,
    date_conversion         TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_session (session_id),
    INDEX idx_statut (statut)
);

-- ----------------------------------------------------------------------------
-- Collection : lignes_paniers
-- Description : Items dans les paniers
-- ----------------------------------------------------------------------------
CREATE TABLE lignes_paniers (
    _id                     ObjectId PRIMARY KEY,
    panier_id               ObjectId NOT NULL REFERENCES paniers(_id),
    produit_id              ObjectId NOT NULL REFERENCES produits(_id),
    boutique_id             ObjectId NOT NULL REFERENCES boutiques(_id),
    
    -- Variation sélectionnée
    variation_selectionnee  JSON,
    
    -- Quantité
    quantite                INT NOT NULL DEFAULT 1,
    
    -- Prix au moment de l'ajout
    prix_unitaire           DECIMAL(10,2),
    
    -- Métadonnées
    date_ajout              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_panier (panier_id),
    INDEX idx_produit (produit_id)
);

-- ----------------------------------------------------------------------------
-- Collection : codes_promo
-- Description : Codes promotionnels et réductions
-- ----------------------------------------------------------------------------
CREATE TABLE codes_promo (
    _id                     ObjectId PRIMARY KEY,
    boutique_id             ObjectId REFERENCES boutiques(_id), -- NULL = promo globale centre
    
    -- Code
    code                    VARCHAR(50) UNIQUE NOT NULL,
    nom_campagne            VARCHAR(200),
    description             TEXT,
    
    -- Type de réduction
    type_reduction          ENUM('pourcentage', 'montant_fixe', 'livraison_gratuite') NOT NULL,
    valeur_reduction        DECIMAL(10,2) NOT NULL,
    
    -- Conditions d'utilisation
    montant_minimum_achat   DECIMAL(10,2) DEFAULT 0.00,
    quantite_minimum        INT DEFAULT 1,
    produits_eligibles      JSON, -- Array d'IDs produits (vide = tous)
    categories_eligibles    JSON, -- Array de catégories
    
    -- Limitations
    usage_limite_global     INT, -- NULL = illimité
    usage_limite_client     INT DEFAULT 1,
    usage_actuel            INT DEFAULT 0,
    
    -- Validité
    date_debut              TIMESTAMP,
    date_fin                TIMESTAMP,
    
    -- Statut
    actif                   BOOLEAN DEFAULT true,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cree_par                ObjectId REFERENCES utilisateurs(_id),
    
    INDEX idx_code (code),
    INDEX idx_boutique (boutique_id),
    INDEX idx_actif (actif),
    INDEX idx_dates (date_debut, date_fin)
);

-- ----------------------------------------------------------------------------
-- Collection : utilisations_codes_promo
-- Description : Historique d'utilisation des codes promo
-- ----------------------------------------------------------------------------
CREATE TABLE utilisations_codes_promo (
    _id                     ObjectId PRIMARY KEY,
    code_promo_id           ObjectId NOT NULL REFERENCES codes_promo(_id),
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    commande_id             ObjectId NOT NULL REFERENCES commandes(_id),
    
    -- Détails utilisation
    montant_reduction       DECIMAL(10,2) NOT NULL,
    
    -- Métadonnées
    date_utilisation        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_code_promo (code_promo_id),
    INDEX idx_client (client_id),
    INDEX idx_commande (commande_id)
);

-- ----------------------------------------------------------------------------
-- Collection : programme_fidelite
-- Description : Comptes fidélité des clients
-- ----------------------------------------------------------------------------
CREATE TABLE programme_fidelite (
    _id                     ObjectId PRIMARY KEY,
    client_id               ObjectId UNIQUE NOT NULL REFERENCES utilisateurs(_id),
    
    -- Points
    solde_points            INT DEFAULT 0,
    total_points_gagnes     INT DEFAULT 0,
    total_points_utilises   INT DEFAULT 0,
    total_points_expires    INT DEFAULT 0,
    
    -- Niveau
    niveau                  ENUM('bronze', 'argent', 'or', 'platine') DEFAULT 'bronze',
    points_prochain_niveau  INT,
    
    -- Statistiques
    nombre_achats           INT DEFAULT 0,
    montant_total_depense   DECIMAL(10,2) DEFAULT 0.00,
    
    -- Carte fidélité
    numero_carte            VARCHAR(50) UNIQUE,
    qr_code_url             VARCHAR(500),
    
    -- Métadonnées
    date_adhesion           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_niveau (niveau),
    INDEX idx_numero_carte (numero_carte)
);

-- ----------------------------------------------------------------------------
-- Collection : transactions_points
-- Description : Historique des transactions de points fidélité
-- ----------------------------------------------------------------------------
CREATE TABLE transactions_points (
    _id                     ObjectId PRIMARY KEY,
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Type de transaction
    type                    ENUM('gain', 'utilisation', 'expiration', 'ajustement', 'bonus', 'parrainage') NOT NULL,
    montant_points          INT NOT NULL, -- Positif pour gain, négatif pour utilisation/expiration
    
    -- Raison
    description             VARCHAR(500),
    commande_id             ObjectId REFERENCES commandes(_id),
    
    -- Points avant/après
    solde_avant             INT NOT NULL,
    solde_apres             INT NOT NULL,
    
    -- Expiration (pour les points gagnés)
    date_expiration         TIMESTAMP,
    
    -- Métadonnées
    date_transaction        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_type (type),
    INDEX idx_date (date_transaction)
);

-- ----------------------------------------------------------------------------
-- Collection : recompenses_fidelite
-- Description : Catalogue des récompenses disponibles
-- ----------------------------------------------------------------------------
CREATE TABLE recompenses_fidelite (
    _id                     ObjectId PRIMARY KEY,
    
    -- Informations récompense
    nom                     VARCHAR(200) NOT NULL,
    description             TEXT,
    image_url               VARCHAR(500),
    
    -- Coût en points
    cout_points             INT NOT NULL,
    
    -- Type de récompense
    type                    ENUM('reduction', 'cadeau', 'acces_vip', 'livraison_gratuite', 'bon_achat') NOT NULL,
    valeur_reduction        DECIMAL(10,2),
    
    -- Disponibilité
    quantite_disponible     INT,
    quantite_utilisee       INT DEFAULT 0,
    
    -- Conditions
    niveau_minimum          ENUM('bronze', 'argent', 'or', 'platine') DEFAULT 'bronze',
    
    -- Validité
    date_debut              TIMESTAMP,
    date_fin                TIMESTAMP,
    duree_validite_jours    INT, -- Durée de validité après récupération
    
    -- Statut
    actif                   BOOLEAN DEFAULT true,
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cout (cout_points),
    INDEX idx_niveau (niveau_minimum),
    INDEX idx_actif (actif)
);

-- ----------------------------------------------------------------------------
-- Collection : recuperations_recompenses
-- Description : Récompenses récupérées par les clients
-- ----------------------------------------------------------------------------
CREATE TABLE recuperations_recompenses (
    _id                     ObjectId PRIMARY KEY,
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    recompense_id           ObjectId NOT NULL REFERENCES recompenses_fidelite(_id),
    
    -- Code unique de la récompense
    code_recompense         VARCHAR(50) UNIQUE,
    qr_code_url             VARCHAR(500),
    
    -- Points dépensés
    points_depenses         INT NOT NULL,
    
    -- Statut
    statut                  ENUM('active', 'utilisee', 'expiree') DEFAULT 'active',
    date_utilisation        TIMESTAMP,
    date_expiration         TIMESTAMP,
    
    -- Métadonnées
    date_recuperation       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_recompense (recompense_id),
    INDEX idx_code (code_recompense),
    INDEX idx_statut (statut)
);

-- ----------------------------------------------------------------------------
-- Collection : evenements
-- Description : Événements organisés dans le centre commercial
-- ----------------------------------------------------------------------------
CREATE TABLE evenements (
    _id                     ObjectId PRIMARY KEY,
    
    -- Informations événement
    titre                   VARCHAR(200) NOT NULL,
    slug                    VARCHAR(200) UNIQUE NOT NULL,
    description_courte      VARCHAR(500),
    description_longue      TEXT,
    
    -- Visuels
    image_affiche           VARCHAR(500),
    galerie_photos          JSON,
    
    -- Catégorie
    categorie               VARCHAR(100), -- "Promotion", "Animation", "Soldes", "Concert", etc.
    
    -- Dates
    date_debut              TIMESTAMP NOT NULL,
    date_fin                TIMESTAMP NOT NULL,
    
    -- Localisation
    lieu                    VARCHAR(200), -- Zone du centre, nom boutique, etc.
    
    -- Participation
    inscription_requise     BOOLEAN DEFAULT false,
    places_disponibles      INT,
    places_reservees        INT DEFAULT 0,
    
    -- Boutiques participantes
    boutiques_participantes JSON, -- Array d'ObjectId
    
    -- Visibilité
    public                  BOOLEAN DEFAULT true,
    mise_en_avant           BOOLEAN DEFAULT false,
    
    -- Statut
    statut                  ENUM('brouillon', 'publie', 'annule', 'termine') DEFAULT 'brouillon',
    
    -- Métadonnées
    date_creation           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cree_par                ObjectId REFERENCES utilisateurs(_id),
    
    INDEX idx_slug (slug),
    INDEX idx_dates (date_debut, date_fin),
    INDEX idx_statut (statut),
    INDEX idx_categorie (categorie)
);

-- ----------------------------------------------------------------------------
-- Collection : inscriptions_evenements
-- Description : Inscriptions des clients aux événements
-- ----------------------------------------------------------------------------
CREATE TABLE inscriptions_evenements (
    _id                     ObjectId PRIMARY KEY,
    evenement_id            ObjectId NOT NULL REFERENCES evenements(_id),
    client_id               ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Informations participant
    nom                     VARCHAR(100),
    email                   VARCHAR(255),
    telephone               VARCHAR(20),
    
    -- Nombre de places
    nombre_places           INT DEFAULT 1,
    
    -- Statut
    statut                  ENUM('confirmee', 'annulee', 'en_attente') DEFAULT 'confirmee',
    
    -- Présence
    present                 BOOLEAN DEFAULT false,
    date_presence           TIMESTAMP,
    
    -- Métadonnées
    date_inscription        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_annulation         TIMESTAMP,
    
    INDEX idx_evenement (evenement_id),
    INDEX idx_client (client_id),
    INDEX idx_statut (statut),
    UNIQUE idx_unique_inscription (evenement_id, client_id)
);

-- ----------------------------------------------------------------------------
-- Collection : notifications
-- Description : Notifications envoyées aux utilisateurs
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    _id                     ObjectId PRIMARY KEY,
    destinataire_id         ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Type et contenu
    type                    VARCHAR(100) NOT NULL, -- "commande", "promo", "evenement", "message", "systeme"
    titre                   VARCHAR(200) NOT NULL,
    message                 TEXT NOT NULL,
    
    -- Action liée
    lien_action             VARCHAR(500),
    icone                   VARCHAR(100),
    
    -- Canaux
    canal                   ENUM('in_app', 'email', 'sms', 'push') NOT NULL,
    
    -- Statut
    lu                      BOOLEAN DEFAULT false,
    date_lecture            TIMESTAMP,
    
    -- Métadonnées
    date_envoi              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration         TIMESTAMP,
    
    INDEX idx_destinataire (destinataire_id),
    INDEX idx_lu (lu),
    INDEX idx_type (type),
    INDEX idx_date_envoi (date_envoi)
);

-- ----------------------------------------------------------------------------
-- Collection : messages
-- Description : Messagerie entre utilisateurs (clients ↔ boutiques, boutiques ↔ admin)
-- ----------------------------------------------------------------------------
CREATE TABLE messages (
    _id                     ObjectId PRIMARY KEY,
    conversation_id         VARCHAR(255) NOT NULL,
    
    -- Expéditeur et destinataire
    expediteur_id           ObjectId NOT NULL REFERENCES utilisateurs(_id),
    destinataire_id         ObjectId NOT NULL REFERENCES utilisateurs(_id),
    
    -- Contenu
    contenu                 TEXT NOT NULL,
    
    -- Pièces jointes
    pieces_jointes          JSON, -- Array d'objets {nom, url, type, taille}
    
    -- Statut
    lu                      BOOLEAN DEFAULT false,
    date_lecture            TIMESTAMP,
    
    -- Métadonnées
    date_envoi              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_conversation (conversation_id),
    INDEX idx_expediteur (expediteur_id),
    INDEX idx_destinataire (destinataire_id),
    INDEX idx_lu (lu),
    INDEX idx_date_envoi (date_envoi)
);

-- ----------------------------------------------------------------------------
-- Collection : parametres_systeme
-- Description : Paramètres globaux du centre commercial
-- ----------------------------------------------------------------------------
CREATE TABLE parametres_systeme (
    _id                     ObjectId PRIMARY KEY,
    
    -- Informations générales
    nom_centre              VARCHAR(200) NOT NULL,
    description             TEXT,
    slogan                  VARCHAR(500),
    logo_url                VARCHAR(500),
    favicon_url             VARCHAR(500),
    
    -- Coordonnées
    adresse                 TEXT,
    code_postal             VARCHAR(20),
    ville                   VARCHAR(100),
    pays                    VARCHAR(100),
    telephone               VARCHAR(20),
    email_contact           VARCHAR(255),
    
    -- Horaires du centre
    horaires_ouverture      JSON,
    
    -- Réseaux sociaux
    facebook_url            VARCHAR(500),
    instagram_url           VARCHAR(500),
    twitter_url             VARCHAR(500),
    youtube_url             VARCHAR(500),
    
    -- Configuration
    devise_principale       VARCHAR(10) DEFAULT 'EUR',
    langues_disponibles     JSON, -- ["fr", "en", "mg"]
    fuseau_horaire          VARCHAR(50) DEFAULT 'Africa/Antananarivo',
    
    -- Programme fidélité
    points_par_euro         INT DEFAULT 10,
    seuil_niveau_argent     INT DEFAULT 500,
    seuil_niveau_or         INT DEFAULT 2000,
    seuil_niveau_platine    INT DEFAULT 5000,
    duree_validite_points   INT DEFAULT 365, -- jours
    
    -- Paiement
    passerelles_paiement    JSON, -- ["stripe", "paypal"]
    frais_livraison_defaut  DECIMAL(10,2) DEFAULT 5.00,
    
    -- SEO
    meta_titre              VARCHAR(200),
    meta_description        VARCHAR(500),
    
    -- Maintenance
    mode_maintenance        BOOLEAN DEFAULT false,
    message_maintenance     TEXT,
    
    -- Métadonnées
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Collection : analytics_vues
-- Description : Tracking des vues de pages/produits/boutiques
-- ----------------------------------------------------------------------------
CREATE TABLE analytics_vues (
    _id                     ObjectId PRIMARY KEY,
    
    -- Type de vue
    type                    ENUM('produit', 'boutique', 'page') NOT NULL,
    
    -- Référence
    produit_id              ObjectId REFERENCES produits(_id),
    boutique_id             ObjectId REFERENCES boutiques(_id),
    page_url                VARCHAR(500),
    
    -- Utilisateur (si connecté)
    utilisateur_id          ObjectId REFERENCES utilisateurs(_id),
    
    -- Informations session
    session_id              VARCHAR(255),
    ip_adresse              VARCHAR(100),
    user_agent              TEXT,
    
    -- Origine
    referrer                VARCHAR(500),
    source                  VARCHAR(100), -- "google", "facebook", "direct", etc.
    
    -- Durée de visite (secondes)
    duree_visite            INT,
    
    -- Métadonnées
    date_visite             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_produit (produit_id),
    INDEX idx_boutique (boutique_id),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_date (date_visite)
);

-- ----------------------------------------------------------------------------
-- Collection : analytics_recherches
-- Description : Tracking des recherches effectuées
-- ----------------------------------------------------------------------------
CREATE TABLE analytics_recherches (
    _id                     ObjectId PRIMARY KEY,
    
    -- Termes de recherche
    terme_recherche         VARCHAR(500) NOT NULL,
    
    -- Filtres appliqués
    filtres                 JSON,
    
    -- Résultats
    nombre_resultats        INT,
    
    -- Utilisateur (si connecté)
    utilisateur_id          ObjectId REFERENCES utilisateurs(_id),
    session_id              VARCHAR(255),
    
    -- A cliqué sur un résultat ?
    resultat_clique         BOOLEAN DEFAULT false,
    position_clic           INT, -- Position dans les résultats
    
    -- Métadonnées
    date_recherche          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_terme (terme_recherche),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_date (date_recherche)
);

-- ----------------------------------------------------------------------------
-- Collection : logs_systeme
-- Description : Journalisation des actions système
-- ----------------------------------------------------------------------------
CREATE TABLE logs_systeme (
    _id                     ObjectId PRIMARY KEY,
    
    -- Type de log
    niveau                  ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    categorie               VARCHAR(100), -- "auth", "commande", "boutique", "systeme", etc.
    
    -- Utilisateur concerné
    utilisateur_id          ObjectId REFERENCES utilisateurs(_id),
    
    -- Action
    action                  VARCHAR(200) NOT NULL,
    description             TEXT,
    
    -- Données additionnelles
    donnees                 JSON, -- Contexte supplémentaire
    
    -- Informations système
    ip_adresse              VARCHAR(100),
    user_agent              TEXT,
    
    -- Métadonnées
    date_log                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_niveau (niveau),
    INDEX idx_categorie (categorie),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_date (date_log)
);

-- ============================================================================
-- INDEX COMPOSITES POUR PERFORMANCES
-- ============================================================================

-- Recherche de produits
CREATE INDEX idx_produits_recherche ON produits(categorie, actif, prix_initial);
CREATE INDEX idx_produits_boutique_actif ON produits(boutique_id, actif);

-- Commandes par client et statut
CREATE INDEX idx_commandes_client_statut ON commandes(client_id, statut, date_creation);

-- Messages non lus
CREATE INDEX idx_messages_non_lus ON messages(destinataire_id, lu, date_envoi);

-- Points fidélité actifs
CREATE INDEX idx_transactions_points_expiration ON transactions_points(client_id, date_expiration);

-- Événements à venir
CREATE INDEX idx_evenements_a_venir ON evenements(statut, date_debut);

-- Analytics par période
CREATE INDEX idx_analytics_periode ON analytics_vues(type, date_visite);

-- ============================================================================
-- NOTES D'IMPLÉMENTATION MONGODB
-- ============================================================================

/*
CONVERSION VERS MONGODB :

1. Les types de données doivent être adaptés :
   - ObjectId pour les identifiants
   - Date pour TIMESTAMP
   - Number pour INT et DECIMAL
   - String pour VARCHAR et TEXT
   - Boolean pour BOOLEAN
   - Array pour JSON arrays
   - Object pour JSON objects

2. Les ENUM seront validés via Mongoose schemas

3. Les INDEX seront créés avec db.collection.createIndex()

4. Les contraintes de clé étrangère sont gérées au niveau applicatif

5. Exemple de document MongoDB pour "utilisateurs" :
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "mot_de_passe_hash": "$2b$10$...",
  "role": "client",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+261340000000",
  "avatar_url": "https://...",
  "email_verifie": true,
  "actif": true,
  "date_creation": ISODate("2026-02-01T10:00:00Z"),
  "date_modification": ISODate("2026-02-01T10:00:00Z")
}

6. Pour les relations :
   - Utiliser populate() de Mongoose pour les jointures
   - Possibilité de dénormalisation pour les données fréquemment consultées

7. Transactions MongoDB pour les opérations critiques :
   - Création commande + mise à jour stock
   - Utilisation points + récupération récompense
*/

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================
