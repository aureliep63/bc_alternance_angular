import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../entities/user.entity";
import {BehaviorSubject, filter, Observable, switchMap} from "rxjs";
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {Borne} from "../../entities/borne.entity";
import {BorneService} from "../../services/borne/borne.service";
import {environment} from "../../../environments/environment.development";
import {ModalBorneComponent} from "../../components/modal-borne/modal-borne.component";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',

})
export class ProfileComponent implements OnInit{

  currentUser$:Observable< User | undefined>
  currentBorneUser$: Observable<Borne[]>;
  imageUrl: string = environment.IMAGE_URL;

  // Référence à la modale
  @ViewChild(ModalBorneComponent) modalBorne: ModalBorneComponent; // pour pouvoir appeler open()
  bornesSubject = new BehaviorSubject<Borne[]>([]);

  get bornes$(): Observable<Borne[]> {
    return this.bornesSubject.asObservable();
  }


  constructor (private userService: UserService,
               private authService: AuthService,
               private router:Router,
               private borneService: BorneService) {}

  ngOnInit (): void {
    this.currentUser$ = this.userService.currentUser$;

    this.currentBorneUser$ = this.currentUser$.pipe(
      filter(user => !!user && !!user.id),
      switchMap(user => this.borneService.getByUserId(user!.id))
    );
    this.currentBorneUser$.subscribe(bornes => {
      console.log(bornes);
      this.bornesSubject.next(bornes);// Check si borne.lieu est bien rempli
    });

  }

  // Méthode pour ouvrir la modale
  openModal() {
    this.modalBorne.open();
  }

  // Méthode pour gérer l'ajout de la borne
  onBorneAdded(_: Borne) {
    this.currentUser$.pipe(
      filter(user => !!user && !!user.id),
      switchMap(user => this.borneService.getByUserId(user!.id))
    ).subscribe(bornes => {
      this.bornesSubject.next(bornes);  // 🔄 Mise à jour complète
    });
  }

}
