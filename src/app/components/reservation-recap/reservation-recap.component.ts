import {Component, inject, Input, ViewChild} from '@angular/core';
import {BorneDto} from "../../entities/borneDto.entity";
import {environment} from "../../../environments/environment";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable, take} from "rxjs";
import {User} from "../../entities/user.entity";
import {UserService} from "../../services/user/user.service";
import {MatStepper} from "@angular/material/stepper";
import {ReservationService} from "../../services/reservation/reservation.service";
import {Router} from "@angular/router";
import {ModalBorneDetailComponent} from "../../pages/profile/bornes/modal-borne-detail/modal-borne-detail.component";
import {Borne} from "../../entities/borne.entity";

@Component({
  selector: 'app-reservation-recap',
  templateUrl: './reservation-recap.component.html',
  styleUrl: './reservation-recap.component.scss'
})
export class ReservationRecapComponent {

  @Input() borne?: BorneDto;
  @Input() filters: any; // Recevra les dates et heures
  isOpen = false;
  imageUrl = environment.IMAGE_URL;
  currentUser$:Observable< User | undefined>
  @ViewChild('stepper') stepper!: MatStepper;
  constructor(private router: Router, private userService: UserService, private _formBuilder: FormBuilder, private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser$;
  }

  open(borne: BorneDto, filters: any) {
    this.borne = borne;
    this.filters = filters;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }


  calculerHeuresEtMinutes(): { heures: number, minutes: number } {
    const debutString = `${this.filters.dateDebut}T${this.filters.heureDebut}:00`;
    const finString = `${this.filters.dateFin}T${this.filters.heureFin}:00`;

    const debut = new Date(debutString);
    const fin = new Date(finString);

    // Calcule la différence en millisecondes
    const differenceEnMs = fin.getTime() - debut.getTime();

    // Convertit la différence en minutes
    const totalMinutes = Math.floor(differenceEnMs / (1000 * 60));

    // Isole les heures et les minutes
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { heures, minutes };
  }

  calculerHeuresTotales(): number {
    const debutString = `${this.filters.dateDebut}T${this.filters.heureDebut}:00`;
    const finString = `${this.filters.dateFin}T${this.filters.heureFin}:00`;

    const debut = new Date(debutString);
    const fin = new Date(finString);

    const differenceEnMs = fin.getTime() - debut.getTime();

    // Convertit la différence en heures, avec des décimales
    const heuresTotales = differenceEnMs / (1000 * 60 * 60);

    return heuresTotales;
  }

// Nouvelle fonction pour calculer le prix total
  calculerPrixTotal(): number {
    const heures = this.calculerHeuresTotales();
    const prixHoraire = this.borne?.prix || 0;

    // Multiplie le nombre total d'heures par le prix horaire
    const prixTotal = heures * prixHoraire;

    return prixTotal;
  }


  confirmReservation() {
    console.log('Confirmation de la réservation...');
    // Logique pour appeler le service de réservation
    this.close();
  }

  saveReservation() {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser && this.borne) {
        // Formater la date et l'heure au format YYYY-MM-DDTHH:mm:ss
        const dateDebutFormatee = `${this.filters.dateDebut}T${this.filters.heureDebut}:00`;
        const dateFinFormatee = `${this.filters.dateFin}T${this.filters.heureFin}:00`;

        // Créer l'objet de réservation avec les IDs directs
        const reservationData = {
          dateDebut: dateDebutFormatee,
          dateFin: dateFinFormatee,
          utilisateurId: currentUser.id, // Nom de la propriété attendue par votre DTO
          borneId: this.borne.id, // Nom de la propriété attendue par votre DTO
          status: 'EN_ATTENTE'
        };

        // Appeler le service pour enregistrer la réservation
        this.reservationService.saveReservation(reservationData).subscribe(
          () => {
            console.log('Réservation créée avec succès');
            // Maintenant, vous pouvez passer à la prochaine étape du stepper
            this.stepper.next();
          },
          (error) => {
            console.error('Erreur lors de la création de la réservation', error);
            // Gérer l'erreur
          }
        );
      }
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
