# QMS Tracker (Suivi des événements Qualité)

Cette application est conçue pour gérer et suivre les événements qualité (Déviation, CAPA, etc.) par département. Elle utilise HTML/CSS/JS (Vanilla) en frontend, et Supabase en backend (Database & Auth).

## Architecture
- `index.html` : Interface principale
- `css/styles.css` : Design personnalisé (complémentaire à Tailwind CSS)
- `js/app.js` : Logique de l'application et intégration Supabase
- `js/config.js` : Fichier contenant vos clés Supabase
- `supabase_schema.sql` : Le code SQL pour créer la base de données sur Supabase

## Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com/).
2. Allez dans **SQL Editor** et collez le contenu du fichier `supabase_schema.sql`. Exécutez le code.
3. Allez dans **Authentication > Providers** et assurez-vous que l'email est activé.
4. Allez dans **Authentication > Users** et créez un premier utilisateur (email + mot de passe) pour pouvoir vous connecter.
5. Allez dans **Project Settings > API**. Copiez l'`URL` et la clé `anon`, puis collez-les dans `js/config.js`.

## Déploiement vers Netlify via GitHub

### Étape 1 : Initialisation en local (Git)
1. Installez Git sur votre PC si ce n'est pas fait.
2. Ouvrez ce dossier dans votre terminal (ou VS Code).
3. Tapez les commandes suivantes :
   ```bash
   git init
   git add .
   git commit -m "Premier commit - App Qualité"
   ```

### Étape 2 : Créer un dépôt GitHub
1. Connectez-vous à votre compte [GitHub](https://github.com/).
2. Créez un nouveau dépôt (Repository) en le nommant par exemple `qms-tracker`.
3. Copiez les commandes proposées par GitHub pour "push an existing repository from the command line" et exécutez-les dans votre terminal :
   ```bash
   git branch -M main
   git remote add origin https://github.com/VOTRE_NOM/qms-tracker.git
   git push -u origin main
   ```

### Étape 3 : Déploiement sur Netlify
1. Connectez-vous à [Netlify](https://www.netlify.com/).
2. Cliquez sur **"Add new site"** > **"Import an existing project"**.
3. Choisissez **GitHub** et autorisez l'accès.
4. Sélectionnez votre dépôt `qms-tracker`.
5. Laissez les paramètres de build vides (c'est du HTML standard) et cliquez sur **"Deploy site"**.
6. En quelques secondes, votre application qualité sera en ligne !
