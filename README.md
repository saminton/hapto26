# Guide de Déploiement WordPress sur Hostinger

## 1. Sauvegarde (si migration)

Si vous effectuez une migration d'un site WordPress existant, commencez par sauvegarder les éléments suivants :

- **Dossier `wp-content/uploads`** : Copiez localement l'intégralité du contenu de ce dossier.
- **Base de données** :
  1.  Dans le panneau Hostinger, accédez à « Bases de données » > « phpMyAdmin ».
  2.  Cliquez sur « Accéder à phpMyAdmin ».
  3.  Dans l'interface phpMyAdmin, sélectionnez l'onglet « Exporter ».
  4.  Choisissez la méthode d'exportation (généralement « Rapide » est suffisant) et le format (SQL).
  5.  Cliquez sur le bouton « Exporter » pour télécharger votre fichier `.sql`.

## 2. Configuration de l'environnement

### 2.1. Installation de WordPress (Hostinger)

1.  Dans le panneau Hostinger, lancez une installation par défaut de WordPress. Cela créera la structure de base du site et la base de données associée.

### 2.2. Accès FTP/SFTP

1.  Dans le panneau Hostinger, accédez à « Fichiers » > « Comptes FTP ».
2.  Récupérez vos identifiants FTP/SFTP. Si nécessaire, créez un nouveau mot de passe.
3.  Connectez-vous à votre serveur via un client FTP/SFTP (ex: FileZilla, Cyberduck) en utilisant ces identifiants.

### 2.3. Configuration de `wp-config.php`

1.  Via votre client FTP/SFTP, accédez à la racine de votre installation WordPress (généralement `public_html`).
2.  Modifiez le fichier `wp-config.php` :
    - Modifiez le préfixe des tables pour des raisons de sécurité (remplacez `'wp_'`) :
      ```php
      $table_prefix = "sm_";
      ```
    - Ajoutez la ligne suivante pour activer le log de débogage :
      ```php
      define("WP_DEBUG_LOG", true);
      ```

### 2.4. Intégration Git pour les thèmes

1.  Via votre client FTP/SFTP, accédez au dossier `public_html/wp-content/themes`.
2.  **Supprimez tout le contenu** de ce dossier.
3.  Dans le panneau Hostinger, accédez à « Avancé » > « GIT ».
4.  **Clé SSH** : Copiez la clé SSH affichée et ajoutez-la à votre compte GitHub (dans les paramètres de votre profil ou du dépôt).
5.  **Configuration du dépôt** :
    - Saisissez l'URL de votre dépôt Git pour le thème.
    - Saisissez `themes-prod` pour le nom de la branche à déployer.
    - Saisissez `wp-content/themes` pour le répertoire de déploiement sur le serveur.
6.  Cliquez sur « Créer ».
7.  Cliquez ensuite sur « Déployer » pour cloner le dépôt de votre thème sur le serveur.

### 2.5. Fichier `.env` pour l'environnement

1.  Avec votre client FTP/SFTP, créez un nouveau fichier nommé `.env` dans le dossier `wp-content/themes/front/`.
2.  Ajoutez le contenu suivant dans ce fichier :
    ```
    APP_ENV=prod
    ```

### 2.6. Téléchargement des plugins et des uploads

1.  **Plugins** : Téléchargez les fichiers de vos plugins (branche `plugin` du repository Git) dans le dossier `wp-content/plugins`.
2.  **Fichiers téléversés (`uploads`)** : Téléchargez les fichiers de votre sauvegarde (`wp-content/uploads`) dans le dossier `wp-content/uploads` du serveur.

## 3. Migration de la base de données

### 3.1. Préparation via phpMyAdmin

1.  Dans le panneau Hostinger, accédez à « Bases de données » > « phpMyAdmin », puis cliquez sur « Accéder à phpMyAdmin ».
2.  Sélectionnez toutes les tables de la base de données, choisissez l'option « Supprimer » (Drop) et validez pour vider la base de données existante.
3.  Dans l'onglet « Importer », téléchargez le fichier `.sql` de votre base de données sauvegardée et cliquez sur « Importer ».

### 3.2. Utilisation de Search-Replace-DB

Cet outil est essentiel pour mettre à jour les URL de votre site dans la base de données.

1.  **Téléchargement et téléversement de l'outil** :
    - Téléchargez l'outil `Search-Replace-DB` depuis GitHub : [https://github.com/interconnectit/Search-Replace-DB](https://github.com/interconnectit/Search-Replace-DB).
    - Via FTP/SFTP, téléchargez le dossier de l'outil (`Search-Replace-DB-4.1.4/`) à la racine de votre dossier `public_html`.
2.  **Accès et configuration de l'outil** :
    - Dans votre navigateur, accédez à l'URL de votre site suivie du nom du dossier de l'outil (ex: `hapto.io/Search-Replace-DB-4.1.4/`).
    - Remplissez les champs comme suit :
      - `replace` : L'ancienne URL de votre site (ex: `rec.hapto.io`). **N'incluez ni `https://` ni le slash final (`/`)**.
      - `with` : La nouvelle URL de votre site (ex: `hapto.io`). **N'incluez ni `https://` ni le slash final (`/`)**.
      - `database name` : La valeur de `DB_NAME` trouvée dans `wp-config.php`.
      - `username` : La valeur de `DB_USER` trouvée dans `wp-config.php`.
      - `password` : La valeur de `DB_PASSWORD` trouvée dans `wp-config.php`.
      - `host` : `localhost`
      - `port` : `8888`
    - Cliquez sur « Search and Replace » pour exécuter l'opération.
3.  **Suppression de l'outil et vérification** :
    - Cliquez sur le bouton « Delete me » pour supprimer l'outil du serveur. **Attention : Cet outil ne doit en aucun cas rester sur le serveur pour des raisons de sécurité !**
    - Accédez à l'URL de connexion de votre administration WordPress `/login` (ex: `hapto.io/login`) pour vérifier que tout fonctionne correctement.

## 4. Protection du serveur par mot de passe (facultatif)

Pour une couche de sécurité supplémentaire, notamment pendant le développement ou pour restreindre l'accès à certaines parties de votre site :

- Dans le panneau Hostinger, accédez à « Avancé » > « Protéger les répertoires par mot de passe ». Suivez les instructions pour configurer une protection par mot de passe pour le répertoire souhaité.
