import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../../services/auth/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
 // const authService = inject(AuthService);
 // const router = inject(Router);

  //si jeton(connecter alors return true
 // if(authService.token) return true;
  // sinon pas de jeton (donc pas co) return false, on renvoi à la page de connexion
 // return router.navigate(['/login']);

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) return true;
  return router.navigate(['/login']);
};
