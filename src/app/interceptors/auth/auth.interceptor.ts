import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {from, NEVER} from "rxjs";

const EXCLUDED_URLS= ['login'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let toHandle = req;

  //req.url correspond à l'url de l'API que l'on appelle
  if( !EXCLUDED_URLS.some(url => req.url.includes(url))){

    const token = authService.token;

    //si on a un token
    if(token){
      toHandle = req.clone(
        {
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        }
      )
    }else{
      // si pas de token
      authService.logout();
      router.navigate(['/login']);
      return from(NEVER); // annule l'envoi de la requete
    }
  }
  return next(toHandle);
};
