import { Component } from '@angular/core';
import {filter, Observable, switchMap, tap} from "rxjs";
import {User} from "../../../entities/user.entity";
import {UserService} from "../../../services/user/user.service";
import {AuthService} from "../../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BorneService} from "../../../services/borne/borne.service";
import {Borne} from "../../../entities/borne.entity";
import {ReservationService} from "../../../services/reservation/reservation.service";
import {Reservation} from "../../../entities/reservation.entity";

@Component({
  selector: 'app-role-user',
  templateUrl: './role-user.component.html',
  styleUrl: './role-user.component.scss'
})
export class RoleUserComponent {

  currentUser$:Observable< User | undefined>
  currentBorneUser$: Observable<Borne[]>;
  currentReservationUser$: Observable<Reservation[]>;
  currentReservationBorneUser$: Observable<Reservation[]>;

  activeTab: string = 'locataire'; // Onglet actif par défaut

  constructor (private userService: UserService,
               private authService: AuthService,
               private router:Router,
               private borneService: BorneService,
               private reservationService: ReservationService,
               private route: ActivatedRoute,) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser$;

    this.currentBorneUser$ = this.currentUser$.pipe(
      filter(user => !!user && !!user.id), // Vérifie que user et user.id existent
      switchMap(user => this.borneService.getByUserId(user!.id)),
      tap(bornes => console.log('Bornes:', bornes)) // Ajoute un log ici
    );
    this.currentReservationUser$ = this.currentUser$.pipe(
      filter(user => !!user && !!user.id), // Vérifie que user et user.id existent
      switchMap(user => this.reservationService.getByUserId(user!.id)),
      tap(reservations => console.log('Reservations for User:', reservations)) // Ajoute un log ici
    );
    this.currentReservationBorneUser$ = this.currentUser$.pipe(
      filter(borne => !!borne && !!borne.id), // Vérifie que user et user.id existent
      switchMap(borne => this.reservationService.getByBorneId(borne!.id)),
      tap(reservations => console.log('Reservations for Borne:', reservations)) // Ajoute un log ici
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
