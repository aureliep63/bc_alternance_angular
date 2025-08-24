import {Component, Input, ViewChild} from '@angular/core';
import {BorneDto} from "../../../../entities/borneDto.entity";
import {environment} from "../../../../../environments/environment";
import {setHours, setMinutes, toDate} from "date-fns";
import {ReservationService} from "../../../../services/reservation/reservation.service";
import {ReservationRecapComponent} from "../../../../components/reservation-recap/reservation-recap.component";
import {formatDate} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../../login/login.component";
import {AuthService} from "../../../../services/auth/auth.service";

@Component({
  selector: 'app-borne-detail',
  templateUrl: './borne-detail.component.html',
  styleUrl: './borne-detail.component.scss'
})
export class BorneDetailComponent {
  @Input() borne?: BorneDto;
  @ViewChild('recapModal') recapModal!: ReservationRecapComponent;

  imageUrl = environment.IMAGE_URL;
  isOpen = false;
  activeTab: string = 'infos';

  filters = {
    ville: '',
    dateDebut: '',
    heureDebut: '',
    dateFin: '',
    heureFin: ''
  };

  isAvailable: boolean = true;
  isReservationPossible: boolean = false;
  showDateError: boolean = false;
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  constructor(
    private reservationService: ReservationService, private dialog: MatDialog, private authService: AuthService
  ) {
  }

  open(borne: BorneDto, filters: any) {
    this.borne = borne;
    // Affectez les valeurs des filtres à l'objet local 'filters'
    this.filters.dateDebut = filters.dateDebut;
    this.filters.heureDebut = filters.heureDebut;
    this.filters.dateFin = filters.dateFin;
    this.filters.heureFin = filters.heureFin;
    this.isOpen = true;
    this.checkAvailability();
  }


  close() {
    this.isOpen = false;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  checkAvailability() {
    if (!this.borne) {
      console.error('La borne est indéfinie. Impossible de vérifier la disponibilité.');
      this.isAvailable = false;
      return;
    }

    // Si les champs sont vides, la borne est considérée comme disponible
    if (!this.filters.dateDebut || !this.filters.heureDebut || !this.filters.dateFin || !this.filters.heureFin) {
      this.isAvailable = true;
      return;
    }

    const startDateTime = new Date(`${this.filters.dateDebut}T${this.filters.heureDebut}`);
    const endDateTime = new Date(`${this.filters.dateFin}T${this.filters.heureFin}`);

    // Appel au back-end
    this.reservationService.checkAvailability(
      this.borne.id,
      startDateTime.toISOString(), // Utiliser ISO string pour la compatibilité avec LocalDateTime
      endDateTime.toISOString()
    ).subscribe(isAvailable => {
      this.isAvailable = isAvailable;
      this.isReservationPossible = isAvailable;
    }, error => {
      console.error("Erreur de vérification de disponibilité", error);
      this.isAvailable = false; // Par sécurité en cas d'erreur
    });
  }

  proceedToReservation() {
    if (!this.filters.dateDebut || !this.filters.heureDebut || !this.filters.dateFin || !this.filters.heureFin) {
      this.showDateError = true;
      this.isAvailable = false;
      return;
    }

    this.showDateError = false;

    // Vérifiez si l'utilisateur est connecté
    if (this.authService.isAuthenticated()) {
      // Si la borne est disponible, on peut passer à la réservation
      this.checkAvailability();
      if (this.isReservationPossible) {
        this.recapModal.open(this.borne!, this.filters);
        // Optionnel : fermer la modale de détail une fois la modale de récap ouverte
        this.close();
      } else {
        console.log('La borne n\'est pas disponible pour cette période.');
        // Le message d'erreur est déjà géré par le *ngIf
      }
    } else {
      // Si l'utilisateur n'est pas connecté, ouvrez la modale de login
      this.dialog.open(LoginComponent, {
        width: '1200px',
        height:'650px',
        panelClass: 'login-modal-panel'
      });
      // On ferme la modale actuelle
      this.close();
    }
  }
}
