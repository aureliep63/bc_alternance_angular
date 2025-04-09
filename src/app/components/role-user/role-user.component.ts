import {Component, OnInit} from '@angular/core';
import {filter, forkJoin, map, mergeMap, Observable, reduce, switchMap, tap} from "rxjs";
import {User} from "../../entities/user.entity";
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BorneService} from "../../services/borne/borne.service";
import {Borne} from "../../entities/borne.entity";
import {ReservationService} from "../../services/reservation/reservation.service";
import {Reservation} from "../../entities/reservation.entity";
import {Lieux} from "../../entities/lieux.entity";

export interface ReservationWithBorne extends Reservation {
  borne: Borne & {
    lieux?: Lieux;
  };
}
@Component({
  selector: 'app-role-user',
  templateUrl: './role-user.component.html',
  styleUrl: './role-user.component.scss'
})

export class RoleUserComponent implements OnInit {

  currentUser$: Observable<User | undefined>;
  currentBorneUser$: Observable<Map<number, Borne>>; // Pour voir les bornes par réservation
  currentBorneResa$: Observable<Map<number, Borne>>;
  locataireResa$: Observable<ReservationWithBorne[]>; // Pour voir toutes les réservations d'un locataire
  proprioResa$: Observable<ReservationWithBorne[]>; // Pour voir toutes les réservations d'un propriétaire

  activeTab: string = 'locataire'; // Onglet actif par défaut

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private borneService: BorneService,
    private reservationService: ReservationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.currentUser$ = this.userService.currentUser$;

    // Pour voir toutes les réservations d'un locataire
    this.locataireResa$ = this.currentUser$.pipe(
      filter(user => !!user && !!user.id),
      switchMap(user => this.reservationService.getByUserId(user!.id)),
      switchMap(reservations => {
        const reservationObservables = reservations.map(resa =>
          this.borneService.getByReservationId(resa.id).pipe(
            map(bornes => {
              const borne = bornes[0];  // Supposons qu'il y ait une seule borne associée à la réservation
              const lieux = borne?.lieux || {};  // Si 'lieux' est undefined, on attribue un objet vide
              return {
                ...resa,
                borne: {
                  ...resa.borne,
                  lieux: lieux  // Ajouter les lieux de la borne à la réservation
                }
              };
            })
          )
        );
        return forkJoin(reservationObservables).pipe(
          map(reservationEntries => reservationEntries.flat() as ReservationWithBorne[])
        );

      }),
      tap(reservations => console.log('Reservations locataire avec lieux:', reservations))
    );


    // Pour voir les réservations d'un propriétaire
    this.proprioResa$ = this.currentUser$.pipe(
      filter(user => !!user && !!user.id),
      switchMap(user => this.borneService.getByUserId(user!.id).pipe(
        switchMap(bornes => {
          const reservationObservables = bornes.map(borne =>
            this.reservationService.getByBorneId(borne.id).pipe(
              map(reservations => reservations.map(resa => {
                // Assurez-vous que 'borne' et 'borne.lieux' sont définis avant d'y accéder
                const lieux = borne.lieux || {};  // Fallback si 'lieux' est undefined
                return {
                  ...resa,
                  borne: {
                    ...resa.borne,
                    lieux: lieux  // Assurez-vous que lieux est attaché de manière correcte
                  }
                };
              }))
            )
          );
          return forkJoin(reservationObservables).pipe(
            map(reservationEntries => reservationEntries.flat() as ReservationWithBorne[])
          );

        })
      )),
      tap(reservations => console.log('Reservations for Proprio:', reservations))
    );





    // Pour voir les bornes par réservation
    this.currentBorneUser$ = this.locataireResa$.pipe(
      switchMap(reservations => {
        const borneObservables = reservations.map(resa =>
          this.borneService.getByReservationId(resa.id).pipe(
            map(bornes => bornes.map(borne => [resa.id, borne] as [number, Borne]))
          )
        );
        return forkJoin(borneObservables).pipe(
          map(borneEntries =>
            borneEntries.flat().reduce((acc, [resaId, borne]) => acc.set(resaId, borne), new Map<number, Borne>())
          )
        );
      })
    );

    // Pour voir les bornes par réservation
    this.currentBorneResa$ = this.proprioResa$.pipe(
      switchMap(reservations => {
        const borneObservables = reservations.map(resa =>
          this.borneService.getByReservationId(resa.id).pipe(
            map(bornes => bornes.map(borne => [resa.id, borne] as [number, Borne]))
          )
        );
        return forkJoin(borneObservables).pipe(
          map(borneEntries =>
            borneEntries.flat().reduce((acc, [resaId, borne]) => acc.set(resaId, borne), new Map<number, Borne>())
          )
        );
      })
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
