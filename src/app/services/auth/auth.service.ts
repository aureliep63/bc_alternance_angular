import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {from, lastValueFrom, map, Observable, switchMap, tap} from "rxjs";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {User, UserHttp} from "../../entities/user.entity";
import {UserService} from "../user/user.service";
import {Auth, signInWithPopup, GoogleAuthProvider, signOut, getIdToken} from '@angular/fire/auth';
import {Router} from "@angular/router";

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

  constructor(private router:Router,private auth: Auth, private http: HttpClient, private localStorage: LocalStorageService, private userService:UserService) {
    this.url=environment.API_URL+environment.API_RESOURCES.USERS
  }

  register(user: UserHttp): Observable<any> {
    return this.http.post(`${this.url}/register`, user); // Assurez-vous que votre endpoint est /register
  }
  // Vous aurez besoin d'un endpoint pour la validation de l'e-mail
  validateEmail(token: string): Observable<any> {
    return this.http.get(`${this.url}/validate-email?token=${token}`);
  }


  loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const idToken = await result.user.getIdToken();

        // Envoi du token au backend
        this.http.post<{ token: string }>(`${this.url}/firebase-login`, { idToken })
          .subscribe({
            next: (response) => {
              localStorage.setItem('token', response.token);
              this.router.navigate(['/profile']); // ou vers la page que tu veux
            },
            error: (err) => {
              console.error('Erreur côté backend :', err);
            }
          });
      })
      .catch((error) => {
        console.error('Erreur lors de la connexion Google :', error);
      });
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

  get tokenValue(): string | null {
    return this.token ?? this.localStorage.getItem(environment.LOCAL_STORAGE.ACCESS_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!this.tokenValue;
  }


}

//Singleton vs Factory?
// Singleton => une seule instance de la classe (utilisé pour controller, guard,repo, service)
// Factory => plusieurs insctances de la classe (coté backend pour par ex les entity)
