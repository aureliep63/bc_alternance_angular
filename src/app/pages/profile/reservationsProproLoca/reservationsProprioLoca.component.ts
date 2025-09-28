import {Component, OnInit, ViewChild} from '@angular/core';
import {filter, forkJoin, map, mergeMap, Observable, reduce, switchMap, take, tap} from "rxjs";
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
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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
  activeTab: string = 'locataire';
  private logoBase64: string = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...";

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
      switchMap(user => this.reservationService.getByUserId(user!.id)), // récup les résa du user
      switchMap(reservations => {
        const reservationObservables = reservations.map(resa =>
          this.borneService.getByReservationId(resa.id).pipe( // on récup la borne associé à la résa pour avoir les infos
            map(bornes => {
              const borne = bornes[0];
              const lieux = borne?.lieux || {};
              return {
                ...resa,
                borne: {
                  ...borne,
                  lieux: lieux
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
      switchMap(user => this.borneService.getByUserId(user!.id).pipe( //récup toutes les bornes du user
        switchMap(bornes => {
          const reservationObservables = bornes.map(borne =>
            this.reservationService.getByBorneId(borne.id).pipe( // pour chaque borne, on récup les résa liées
              map(reservations => reservations.map(resa => {
                const lieux = borne.lieux || {};
                return {
                  ...resa,
                  borne: {
                    ...borne,
                    lieux: lieux
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

    // 1. S'abonner au fragment d'URL lors de l'initialisation du composant
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        if (fragment === 'resaLocataire') {
          // Si le fragment est 'resaLocataire', active cet onglet
          this.setActiveTab('locataire');
        } else if (fragment === 'resaProprietaire') {
          // (Optionnel) Pour une future ancre propriétaire
          this.setActiveTab('proprietaire');
        }
      }
    });
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
  statusOptions: Array<ReservationHttp['status']> = ['ACCEPTER', 'REFUSER'];
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

  annulationEnCours: Set<number> = new Set();

  cancelReservation(resa: ReservationWithBorne) {
    this.annulationEnCours.add(resa.id);

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
        this.annulationEnCours.delete(resa.id);
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


  selectedResa: any; // réservation sélectionnée

  openConfirmModal(resa: any) {
    this.selectedResa = resa;
    // Ouvrir la modal via Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('confirmCancelModal')!);
    modal.show();
  }

  confirmCancel() {
    if (this.selectedResa) {
      this.cancelReservation(this.selectedResa);
      this.selectedResa = null;
    }
    const modalEl = document.getElementById('confirmCancelModal')!;
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }

  formatHeuresMinutes(totalHeures: number): string {
    const heures = Math.floor(totalHeures);
    const minutes = Math.round((totalHeures - heures) * 60);
    return `${heures}h ${minutes}min`;
  }

  downloadPdf(resa: any) {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      const doc = new jsPDF();

      const img = new Image();
      img.src = 'assets/logoo.png';
      img.onload = () => {
        doc.addImage(img, 'PNG', 15, 10, 30, 30);

        doc.setFontSize(22);
        doc.setTextColor(177, 188, 158);
        doc.text('ELECTRICITY ', 105, 20, { align: 'right' });
        doc.text(' BUSINESS', 105, 30, { align: 'right' });

        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('Récapitulatif', 105, 50, { align: 'center' });

        doc.setDrawColor(177, 188, 158);
        doc.setLineWidth(0.8);
        doc.line(20, 55, 190, 55);

        //  Infos currentUser
        let yPos = 65;
        doc.setFontSize(12);
        doc.text(`${user?.nom ?? ''} ${user?.prenom ?? ''}`, 20, yPos);
        doc.text(`${user?.email ?? ''}`, 20, yPos + 12);
        doc.text(`${user?.telephone ?? ''}`, 20, yPos + 19);
        doc.text(`${user?.nomRue ?? ''}, ${user?.ville ?? ''}  ${user?.codePostal ?? ''}`, 20, yPos + 26);

         // --- Infos Borne ---
        let borneY = yPos + 30;
        const xRight = 130;
        doc.text(`Borne ID : ${resa.borne?.id ?? ''}`, xRight, borneY);
        doc.text(`${resa.borne?.lieux?.adresse ?? ''}`, xRight, borneY + 7);
        doc.text(`${resa.borne?.lieux?.ville ?? ''} ${resa.borne?.lieux?.codePostal ?? ''}  `, xRight, borneY + 14);


        // --- Formattage date ---
        const formatDate = (d: string) =>
          new Date(d).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

        // --- Calculs ---
        const prixHoraire = resa.borne?.prix || 0;
        const heures = this.calculerHeuresTotales(resa);
        const prixTotal = this.calculerPrixTotal(resa);

        // --- Tableau réservation ---
        const info = [
          ['ID Réservation', resa.id],
          ['Status', resa.status === 'EN_ATTENTE' ? 'EN ATTENTE' : resa.status],
          ['Début', formatDate(resa.dateDebut)],
          ['Fin', formatDate(resa.dateFin)],
          ['Prix / heure', prixHoraire.toFixed(2) + ' €/h'],
          ['Durée totale', this.formatHeuresMinutes(heures)],
          ['Prix total', prixTotal.toFixed(2) + ' €'],
        ];

        autoTable(doc, {
          startY: yPos + 60,
          head: [[{ content: 'Détails de la Réservation', colSpan: 2,  styles: {
              halign: 'center',
              fillColor: [177, 188, 158],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 16
            } }]],
          body: info,
          theme: 'plain', // retire toutes les bordures par défaut
          styles: { fontSize: 12, cellPadding: 4 },
          didDrawCell: (data) => {
            if (data.section === 'body' || data.section === 'head') {
              const doc = data.doc;
              const { x, y, width, height } = data.cell;

              //  la ligne du bas
              doc.setDrawColor(200); // gris clair
              doc.setLineWidth(0.2);
              doc.line(x, y + height, x + width, y + height);


            }
          }
        });

        // --- Footer ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(177, 188, 158);
        doc.text(
          'Electricity Business - Pour toute question, contactez-nous au 01 23 45 67 89',
          105,
          pageHeight - 10,
          { align: 'center' }
        );

        doc.save(`reservation_${resa.id}.pdf`);
      };
    });
  }

  exportReservationsExcel() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) return;

      // Récupérer les réservations du locataire (ou proprio)
      this.locataireResa$.pipe(take(1)).subscribe(reservations => {
        if (!reservations || reservations.length === 0) return;

        const data = reservations.map(resa => ({
        'ID Réservation': resa.id,
        'Nom Utilisateur': user?.nom ?? '',
        'Prénom Utilisateur': user?.prenom ?? '',
        'Email': user?.email ?? '',
        'Borne ID': resa.borne?.id ?? '',
        'Adresse Borne': resa.borne?.lieux?.adresse ?? '',
        'Ville Borne': resa.borne?.lieux?.ville ?? '',
        'Code Postal Borne': resa.borne?.lieux?.codePostal ?? '',
        'Status': resa.status === 'EN_ATTENTE' ? 'EN ATTENTE' : resa.status,
        'Début': new Date(resa.dateDebut).toLocaleString(),
        'Fin': new Date(resa.dateFin).toLocaleString(),
        'Prix / heure': (resa.borne?.prix ?? 0).toFixed(2),
        'Durée totale (h)': this.calculerHeuresTotales(resa).toFixed(2),
        'Prix total (€)': this.calculerPrixTotal(resa).toFixed(2),
      }));

      // Créer un workbook et une feuille
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Réservations');

      // Générer le fichier Excel
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `reservations_${user.nom}_${user.prenom}.xlsx`);
    });
    });

  }
}


