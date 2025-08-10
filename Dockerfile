# FROM node:20.15 AS vendor

# WORKDIR /srv/

# COPY ./package.json ./package-lock.json /srv/

# RUN npm install

# FROM vendor AS builder

# COPY ./ /srv/

# RUN npm run build

# FROM nginx:1.27 AS server

# COPY --from=builder /srv/dist/bc-angular-alternance/browser/ /usr/share/nginx/html/

# Étape 1: Utiliser une image de base pour la compilation d'Angular
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du projet
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier le code source de l'application
COPY . .

# Compiler l'application Angular pour la production
RUN npm run build --prod

# Étape 2: Utiliser une image de serveur web légère pour servir l'application
FROM nginx:1.23.4-alpine

# Copier le contenu compilé depuis l'étape de build
COPY --from=build /app/dist/votre-projet /usr/share/nginx/html

# Copier une configuration Nginx personnalisée pour les SPA (facultatif mais recommandé)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port par défaut de Nginx
EXPOSE 80
