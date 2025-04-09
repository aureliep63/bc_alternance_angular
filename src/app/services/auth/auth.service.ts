import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment.development";
import {from, lastValueFrom, map, switchMap, tap} from "rxjs";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {User, UserHttp} from "../../entities/user.entity";
import {UserService} from "../user/user.service";


interface LoginHttp {
  token :string
}

@Injectable({
  //provideIn c'est création d'un singleton
  providedIn: 'root'
})
export class AuthService {

  private url:string
  token?: string;

  constructor(private http: HttpClient, private localStorage: LocalStorageService, private userService:UserService) {
    // https://api.escuelajs.co/api/v1/auth
    this.url=environment.API_URL+environment.API_RESOURCES.USERS
  }

 async checkLocalStorageToken(): Promise<void> {
    const tokenLocalStorage = this.localStorage.getItem(environment.LOCAL_STORAGE.ACCESS_TOKEN);
    if (tokenLocalStorage) {
      this.token = tokenLocalStorage;
      try {
        await this.getProfile();
      } catch (error) {
        this.logout(); // Se déconnecter si le profil ne peut pas être récupéré
      }
    } else {
      console.log("Aucun token trouvé dans localStorage.");
    }
  }


 async login(email: string, password: string, remember: boolean): Promise<void> {
    const obs = this.http
      .post<LoginHttp>(`${this.url}/login`, { email, password })
      .pipe(
        tap(res => {
          if (remember) {
            this.localStorage.setItem(environment.LOCAL_STORAGE.ACCESS_TOKEN, res.token);
          }
          this.token = res.token;
          this.userService.currentUser = { email } as User;
        }),
        switchMap(() => from(this.getProfile()))
      );
    await lastValueFrom(obs);
  }


  async getProfile(): Promise<void> {
    const obs = this.http
      .get<UserHttp>(`${this.url}/current-user`)
      .pipe(
        tap(userHttp => console.log("Réponse API user:", userHttp)),
        map(userHttp => {
          console.log('userHttp: ', userHttp);
          console.log('userFromHttp: ', User.fromHttp(userHttp));

          return User.fromHttp(userHttp);

        }),
        tap(user => {
          this.userService.currentUser = user;
        }),
        map(() => undefined)
      );
    await lastValueFrom(obs);
  }


  logout():void{
    this.localStorage.removeItem(environment.LOCAL_STORAGE.ACCESS_TOKEN)
    this.userService.currentUser =undefined
    this.token = undefined
  }

}

//Singleton vs Factory?
// Singleton => une seule instance de la classe (utilisé pour controller, guard,repo, service)
// Factory => plusieurs insctances de la classe (coté backend pour par ex les entity)
