import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {from, NEVER} from "rxjs";

// Ajout de 'register' et potentiellement 'validate-email' (si c'est aussi un endpoint public sans auth)
// Ou mieux, l'URL de base de votre API d'authentification
const EXCLUDED_URLS = ['login', 'register', 'validate-email','resend-code', 'check-email'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let toHandle = req;

  if (!EXCLUDED_URLS.some(url => req.url.includes(url))) {
    const token = authService.tokenValue;

    if (token) {
      toHandle = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    } else {
      console.warn(`Tentative d'accès sans token → redirection /login`);
      authService.logout();
      router.navigate(['/login']);
      return from(NEVER);
    }
  }
  return next(toHandle);
};

