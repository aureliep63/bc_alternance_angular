import { Injectable } from '@angular/core';
import {User} from "../../entities/user.entity";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Observable = un flux que l'on peut écouter (readonly)
  // Pour se connecter '.subscribee()' et pour se déconnecter '/unsubscribe()'
  // Subject = flux ds lequel on peut écrire et qu'on peut écouter
  // observable dans lequel on peut écrire (read/write)

  // 3 types de Subject:
  // Subject = Flux read/write sans conservation de donnée qui transite
  // BehaviorSubject = Subject qui conserve la dernière donnée qui transite
  // ReplaySubject = BeaviorSubject qui conserve un historique de N (où N est un nb que le dev définit) des données qui ont transité (plus rare en utilisation)

  // currentUser?: User
  private _currentUser$: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined)
  currentUser$ = this._currentUser$.asObservable() // lecture seule

  set currentUser (user: User | undefined) {
    this._currentUser$.next(user)
  }

  get currentUser (): User | undefined {
    return this._currentUser$.getValue()
  }
}

