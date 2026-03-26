# Guide de déploiement WordPress

Ce guide détaille les étapes pour déployer un site WordPress sur Hostinger, en incluant la migration, l'intégration Git et la configuration de l'environnement.

## 1. Sauvegarde (si migration)

S'il s'agit d'une migration d'un site existant, effectuez une sauvegarde complète des éléments suivants :

- **Base de données** : Fichier `.sql`
- **Fichiers téléversés** : Contenu du dossier `wp-content/uploads`

## 2. Création de l'environnement WordPress

### Panel Hostinger

1.  **Installation de WordPress sans thème** :
    - Dans le panneau de contrôle Hostinger, configurez une nouvelle installation WordPress sans thème.
    - Cette étape crée l'environnement initial, y compris la base de données et les variables d'environnement nécessaires.
2.  **Récupération des informations FTP** :
    - Accédez à la section « Fichiers » > « Comptes FTP ».
    - Récupérez les informations de connexion FTP/SFTP.

### Connexion FTP/SFTP

1.  **Sauvegarde locale des fichiers clés** :
    - Connectez-vous via FTP/SFTP et créez une sauvegarde locale des fichiers suivants à la racine de votre installation WordPress :
      - `.htaccess`
      - `.htaccess.bk`
      - `.private`
      - `wp-config.php`
2.  **Suppression du contenu existant** :
    - Supprimez **tout le contenu** du dossier `public_html` (ou du répertoire racine de votre site).

## 3. Intégration Git

### Panel Hostinger

1.  **Accéder à la section Git** :
    - Dans le panneau de contrôle Hostinger, allez dans « Avancé » > « GIT ».
2.  **Générer et ajouter la clé SSH** :
    - Générez une nouvelle clé SSH.
    - Ajoutez cette clé publique au compte GitHub associé à votre dépôt.
3.  **Renseigner les informations du dépôt** :
    - Renseignez les champs « Dépôt » (URL de votre dépôt Git) et « Branche » (ici, `prod`).
4.  **Créer le dépôt** :
    - Cliquez sur le bouton « Créer ».
5.  **Déployer le code** :
    - Cliquez sur le bouton « Déployer » pour transférer le contenu de votre dépôt Git vers `public_html`.
6.  **Déploiement automatique (Optionnel)** :
    - Configurez le déploiement automatique si vous souhaitez que les mises à jour de votre dépôt soient déployées automatiquement.

## 4. Configuration de l'environnement

### Connexion FTP/SFTP

1.  **Restaurer les fichiers clés** :
    - Replacez les fichiers que vous avez sauvegardés localement à la racine de `public_html` :
      - `.htaccess`
      - `.htaccess.bk`
      - `.private`
      - `wp-config.php`
2.  **Modification de `wp-config.php`** :
    - Ouvrez le fichier `wp-config.php` et effectuez les modifications suivantes :
      - Modifiez le préfixe des tables :
        ```php
        $table_prefix = "sm_";
        ```
      - Ajoutez la ligne pour le log de débogage :
        ```php
        define("WP_DEBUG_LOG", true);
        ```
      - Modifiez la constante de débogage (optionnel) :
        ```php
        define("WP_DEBUG", true); // À définir sur 'false' avant toute mise en production
        ```
3.  **Création du fichier `.env`** :
    - Dans le dossier `wp-content/themes/front/`, créez un fichier nommé `.env`.
    - Ajoutez-y le contenu suivant :
      ```
      APP_ENV=prod
      ```

## 5. Mise à jour de la base de données

### Panel Hostinger

1.  **Accéder à phpMyAdmin** :
    - Dans le panneau de contrôle Hostinger, allez dans « Base de données » > « phpMyAdmin ».
2.  **Vider les tables existantes** :
    - Sélectionnez toutes les tables et videz-les.
3.  **Importer la base de données** :
    - Dans l'onglet « Importer », importez le fichier `.sql` de votre sauvegarde.

### Connexion FTP/SFTP

1.  **Ajouter l'outil Search-Replace-DB** :
    - Téléchargez l'outil `Search-Replace-DB` depuis GitHub : [https://github.com/interconnectit/Search-Replace-DB](https://github.com/interconnectit/Search-Replace-DB).
    - Placez le dossier de l'outil à la racine de `public_html`.

### Utilisation de l'outil Search-Replace-DB

1.  **Accéder à l'outil** :
    - Dans votre navigateur, accédez à l'URL de votre site suivie du nom du dossier de l'outil (par exemple : `votresite.com/db-replace`).
2.  **Remplir les champs** :
    - `replace` : L'ancienne URL de votre site (ex: `http://old-site.com`).
    - `with` : La nouvelle URL de votre site (ex: `https://votresite.com`). **Assurez-vous de ne pas inclure de slash final (`/`)**.
    - `database name` : Le nom de votre base de données (trouvé dans `wp-config.php`).
    - `username` : Le nom d'utilisateur de la base de données (trouvé dans `wp-config.php`).
    - `password` : Le mot de passe de la base de données (trouvé dans `wp-config.php`).
    - `host` : `localhost`
    - `port` : `8888`
3.  **Lancer l'opération** :
    - Cliquez sur le bouton pour lancer le remplacement.
4.  **Vérifier l'accès à l'administration** :
    - Vérifiez que le panneau d'administration de WordPress est fonctionnel en accédant à `votresite.com/wp-admin` (ou `votresite.com/login` si personnalisé).
5.  **Supprimer l'outil** :
    - **Très important** : Supprimez l'outil `Search-Replace-DB` de votre serveur en cliquant sur le bouton « Delete Me » dans l'interface de l'outil.

## 6. Transfert des fichiers téléversés

### Connexion FTP/SFTP

1.  **Restaurer les fichiers `uploads`** :
    - Transférez la sauvegarde de vos fichiers téléversés (`uploads`) dans le dossier `wp-content/uploads`.

## 6. Protection du serveur avec un mot de passe

### Panel Hostinger

1.  **Activer / desactiver le mot de passe** :
    - Dans le panneau de contrôle Hostinger, allez dans « Avancé » > « Protéger les répertoires par mot de passe ».
