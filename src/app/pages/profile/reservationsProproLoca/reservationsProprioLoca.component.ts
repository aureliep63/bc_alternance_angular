import {Component, OnInit, ViewChild} from '@angular/core';
import {filter, forkJoin, map, mergeMap, Observable, reduce, switchMap, tap} from "rxjs";
import {User} from "../../../entities/user.entity";
import {UserService} from "../../../services/user/user.service";
import {AuthService} from "../../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BorneService} from "../../../services/borne/borne.service";
import {Borne} from "../../../entities/borne.entity";
import {ReservationService} from "../../../services/reservation/reservation.service";
import {Reservation, ReservationHttp} from "../../../entities/reservation.entity";
import {Lieux} from "../../../entities/lieux.entity";
import {BorneDto} from "../../../entities/borneDto.entity";
import {ModalBorneDetailComponent} from "../bornes/modal-borne-detail/modal-borne-detail.component";
import * as bootstrap from "bootstrap";

export interface ReservationWithBorne extends Reservation {
  borne: Borne & {
    lieux?: Lieux;
  };
}
@Component({
  selector: 'app-reservationsProproLoca',
  templateUrl: './reservationsProprioLoca.component.html',
  styleUrl: './reservationsProprioLoca.component.scss'
})

export class RoleUserComponent implements OnInit {
  @ViewChild('modalDetails') modalDetails!: ModalBorneDetailComponent;
  bornes: BorneDto[] = [];
  currentUser$: Observable<User | undefined>;
  currentBorneUser$: Observable<Map<number, Borne>>; // Pour voir les bornes par réservation
  currentBorneResa$: Observable<Map<number, Borne>>;
  locataireResa$: Observable<ReservationWithBorne[]>; // Pour voir toutes les réservations d'un locataire
  proprioResa$: Observable<ReservationWithBorne[]>; // Pour voir toutes les réservations d'un propriétaire
  deleteId: number | null = null;
  activeTab: string = 'locataire'; // Onglet actif par défaut
  toBorneDto(borne: Borne): BorneDto {
    return {
      id: borne.id,
      nom: borne.nom,
      photo: borne.photo,
      puissance: borne.puissance,
      estDisponible: borne.estDisponible,
      instruction: borne.instruction,
      surPied: borne.surPied,
      prix: borne.prix,
      utilisateurId: borne.utilisateurId,
      lieuId: borne.lieuId,
      mediasId: [],
      reservationsId: [],
      lieux: borne.lieux ? {
        id: borne.lieux.id,
        adresse: borne.lieux.adresse,
        codePostal: borne.lieux.codePostal,
        ville: borne.lieux.ville,
        latitude: borne.lieux.latitude,
        longitude: borne.lieux.longitude
      } : null
    };
  }
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
                  ...borne,
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
                    ...borne,
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
  deleteBorne(id: number): void {

  }
  openDeleteModal(id: number): void {
    this.deleteId = id;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  viewDetails(borne: BorneDto) {
    this.modalDetails.open(borne);
  }
  statusOptions: Array<ReservationHttp['status']> = ['ACCEPTER', 'EN_ATTENTE', 'REFUSER', 'ANNULER'];
  editStatusId: number | null = null;

  saveStatus(resa: ReservationWithBorne) {
    this.reservationService.updateStatus(resa.id, resa.status).subscribe({
      next: (response) => {
        console.log('Statut mis à jour avec succès');
        this.editStatusId = null;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
      }
    });
  }

  cancelReservation(resa: ReservationWithBorne) {
    console.log('Tentative d\'annulation de la réservation ID:', resa.id);

    this.reservationService.updateStatus(resa.id, 'ANNULER').subscribe({
      next: (response) => {
        console.log('Réservation annulée avec succès. Réponse du serveur:', response);
        // Mettre à jour le statut localement pour que l'UI se rafraîchisse immédiatement
        resa.status = 'ANNULER';
        // Si vous utilisez une observable pour `proprioResa$`, vous pourriez vouloir
        // recharger la liste complète pour s'assurer que toutes les données sont à jour.
        // Par exemple: this.loadProprioReservations();
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation de la réservation:', err);
        // Gérer l'erreur, par exemple afficher un message à l'utilisateur
      }
    });
  }


  calculerHeuresTotales(resa: ReservationWithBorne): number {
    const debut = new Date(resa.dateDebut);
    const fin = new Date(resa.dateFin);

    const differenceEnMs = fin.getTime() - debut.getTime();
    return differenceEnMs / (1000 * 60 * 60); // en heures décimales
  }

  calculerPrixTotal(resa: ReservationWithBorne): number {
    const heures = this.calculerHeuresTotales(resa);
    const prixHoraire = resa.borne?.prix || 0;
    return heures * prixHoraire;
  }

}
