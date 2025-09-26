import {Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, filter, Observable, switchMap} from "rxjs";
import {User} from "../../../entities/user.entity";
import {Borne} from "../../../entities/borne.entity";
import {environment} from "../../../../environments/environment";
import {BorneDto} from "../../../entities/borneDto.entity";
import {ModalBorneComponent} from "./modal-borne/modal-borne.component";
import {ModalBorneDetailComponent} from "./modal-borne-detail/modal-borne-detail.component";
import {UserService} from "../../../services/user/user.service";
import {AuthService} from "../../../services/auth/auth.service";
import {Router} from "@angular/router";
import {BorneService} from "../../../services/borne/borne.service";
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-bornes',
  templateUrl: './bornes.component.html',
  styleUrl: './bornes.component.scss'
})
export class BornesComponent implements OnInit{

  currentUser$:Observable< User | undefined>
  currentBorneUser$: Observable<Borne[]>;

  bornes: BorneDto[] = [];
  deleteId: number | null = null;
  getPhotoUrl(photo: string): string {
    if (photo.startsWith('http')) {
      return photo; // cas Cloudinary (prod)
    }
    return environment.IMAGE_URL + photo; // cas local
  }


  // Référence à la modale
  @ViewChild(ModalBorneComponent) modalBorne: ModalBorneComponent; // pour pouvoir appeler open()
  @ViewChild('modalDetails') modalDetails!: ModalBorneDetailComponent;
  bornesSubject = new BehaviorSubject<Borne[]>([]);
  get bornes$(): Observable<Borne[]> {
    return this.bornesSubject.asObservable();
  }


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
  onBorneAdded(_: BorneDto) {
    this.currentUser$.pipe(
      filter(user => !!user && !!user.id),
      switchMap(user => this.borneService.getByUserId(user!.id))
    ).subscribe(bornes => {
      this.bornesSubject.next(bornes);  // 🔄 Mise à jour complète
    });
  }

  deleteBorne(id: number): void {
    this.borneService.delete(id).pipe(
      switchMap(() => this.currentUser$),
      filter(user => !!user && !!user.id),
      switchMap(user => this.borneService.getByUserId(user!.id))
    ).subscribe(bornes => {
      this.bornesSubject.next(bornes);
    });
  }


// Ouvre la modal avec l’ID de la borne à supprimer
  openDeleteModal(id: number): void {
    this.deleteId = id;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

// Quand l'utilisateur confirme la suppression
  onConfirmDelete(): void {
    if (this.deleteId !== null) {
      this.deleteBorne(this.deleteId); // Appelle la méthode delete standard
      this.deleteId = null;

      const modalElement = document.getElementById('confirmDeleteModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide(); // Cache la modale
      }
    }
  }



  viewDetails(borne: BorneDto) {
    this.modalDetails.open(borne);
  }




}
