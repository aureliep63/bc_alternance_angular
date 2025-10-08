

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";
import { NEVER, from } from "rxjs";

const AUTH_URLS_TO_EXCLUDE_TOKEN = ['login', 'register', 'validate-email', 'resend-code', 'check-email', 'geocoding/coordinates' ,'geocode', "firebase-login"];

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

  if (!token && !isAuthUrl && req.url.includes('user')) {
    // Si la route contient 'user' et qu'on n'a pas de jeton, c'est très probablement une erreur.
    console.warn(`Tentative d'accès à une route protégée sans token → redirection`);
    authService.logout();
    router.navigate(['/']);
    return from(NEVER); // Bloque la requête pour éviter des erreurs inutiles
  }


  return next(toHandle);
};
