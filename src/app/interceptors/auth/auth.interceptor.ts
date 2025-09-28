

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";
import { NEVER, from } from "rxjs";

const AUTH_URLS_TO_EXCLUDE_TOKEN = ['login', 'register', 'validate-email', 'resend-code', 'check-email', 'geocoding/coordinates' ,'geocode'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.tokenValue;
  let toHandle = req;

  // 1. On vérifie si c'est une requête d'AUTH (où on ne doit jamais ajouter le jeton)
  const isAuthUrl = AUTH_URLS_TO_EXCLUDE_TOKEN.some(url => req.url.includes(url));

  // 2. Si un jeton est présent ET que ce n'est PAS une requête d'AUTH
  if (token && !isAuthUrl) {
    //  On ajoute le jeton à la requête (Bornes, Réservations, etc.)
    toHandle = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // 3. Si aucun jeton n'est présent (et que la route n'est pas d'AUTH),
  // la requête continuera SANS jeton.
  // 🚨 Le backend doit alors renvoyer 401/403 si la route est privée.

  // 4. Blocage explicite pour la déconnexion après échec du jeton (Ancienne logique)
  // On ne doit faire cela que si c'est une requête XHR qui échoue car elle est PRIVÉE.
  // Laisser le backend gérer l'échec 401/403 et utiliser un gestionnaire global d'erreurs (Global HTTP Error Handler)
  // est la meilleure pratique, mais pour rester simple, nous gérons la déconnexion ici
  // seulement si le jeton est manquant et qu'on accède à une URL qui n'est pas d'auth.
  if (!token && !isAuthUrl && req.url.includes('user')) {
    // Si la route contient 'user' et qu'on n'a pas de jeton, c'est très probablement une erreur.
    console.warn(`Tentative d'accès à une route protégée sans token → redirection`);
    authService.logout();
    router.navigate(['/']);
    return from(NEVER); // Bloque la requête pour éviter des erreurs inutiles
  }


  return next(toHandle);
};
