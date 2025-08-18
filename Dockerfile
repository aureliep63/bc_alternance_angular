# ÉTAPE 1 : Construction de l'application Angular
# Cette étape est dédiée à la compilation du code source. Elle utilise une image Node.js.
FROM node:18-alpine as build

# Définit le répertoire de travail à l'intérieur du conteneur.
# Toutes les commandes qui suivent (COPY, RUN) s'exécuteront à partir de cet emplacement.
WORKDIR /app

# Copie les fichiers de dépendances du projet depuis la machine locale vers le conteneur.
COPY package.json package-lock.json ./

# Installe les dépendances Node.js. `npm ci` garantit une installation propre et reproductible
# basée sur `package-lock.json`.
RUN npm ci

# Copie tout le reste du code source du projet dans le conteneur.
COPY . .

# Lance la commande de compilation d'Angular en mode production.
# Cette commande génère les fichiers statiques optimisés (HTML, CSS, JS).
RUN npm run build -- --configuration production

# ÉTAPE 2 : Création de l'image finale avec un serveur web
# Cette étape crée une nouvelle image beaucoup plus légère en utilisant un serveur web Nginx.
# On ne copie que les fichiers compilés de l'étape précédente,
# sans inclure toutes les dépendances de développement de Node.js.
FROM nginx:alpine

# Copie les fichiers compilés (build) depuis l'étape 'build' vers le répertoire
# par défaut de Nginx pour les fichiers à servir.
COPY --from=build /app/dist/bc-angular-alternance/browser /usr/share/nginx/html

# Indique que le conteneur écoute sur le port 80.
EXPOSE 80

# Commande qui sera exécutée au démarrage du conteneur.
# Elle lance Nginx en premier plan pour que le conteneur ne se termine pas.
CMD ["nginx", "-g", "daemon off;"]
