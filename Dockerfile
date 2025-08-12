# Étape 1 : Le build Angular
FROM node:18-alpine as build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Étape 2 : Le serveur web Nginx
FROM nginx:alpine

# Copie les fichiers buildés de l'étape précédente vers le serveur Nginx
COPY --from=build /app/dist/bc-angular-alternance/browser /usr/share/nginx/html

# Expose le port 80 pour le serveur web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
