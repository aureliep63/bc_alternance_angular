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
import * as bootstrap from 'bootstrap';
import {BorneDto} from "../../entities/borneDto.entity";
import {ModalBorneViewComponent} from "../../components/modal-borne-view/modal-borne-view.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',

})
export class ProfileComponent implements OnInit{

  currentUser$:Observable< User | undefined>
  currentBorneUser$: Observable<Borne[]>;
  imageUrl: string = environment.IMAGE_URL;
  bornes: BorneDto[] = [];
  deleteId: number | null = null;
  editMode: boolean = false;
  userEditable: Partial<User> = {};
  dateDeNaissanceString: string = '';

  // Référence à la modale
  @ViewChild(ModalBorneComponent) modalBorne: ModalBorneComponent; // pour pouvoir appeler open()
  @ViewChild('modalDetails') modalDetails!: ModalBorneViewComponent;
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
      latitude: borne.latitude,
      longitude: borne.longitude,
      prix: borne.prix,
      utilisateurId: borne.utilisateurId,
      lieuId: borne.lieuId,
      lieux: borne.lieux,
      mediasId: [], // Remplir si tu les récupères
      reservationsId: [] // Idem
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
      this.bornesSubject.next(bornes); // ✅ Mise à jour de la liste
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

  enableEdit(currentUser: User): void {
    this.editMode = true;
    // Clone des données pour édition locale
    this.userEditable = { ...currentUser,};
    // Transforme la date en string 'yyyy-MM-dd'
    if (currentUser.dateDeNaissance) {
      const d = new Date(currentUser.dateDeNaissance);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      this.dateDeNaissanceString = `${year}-${month}-${day}`;
    } else {
      this.dateDeNaissanceString = '';
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.userEditable = {};
    this.dateDeNaissanceString = '';

  }

  saveEdit(): void {
    if (!this.userEditable || !this.userEditable.id) return;
    if (this.dateDeNaissanceString) {
      this.userEditable.dateDeNaissance = new Date(this.dateDeNaissanceString);
    }
    // Appel à ton service pour mettre à jour l'utilisateur
    this.userService.updateUser(this.userEditable as User).subscribe({
      next: (updatedUser: User) => {
        // Mettre à jour le BehaviorSubject
        this.userService.currentUser = updatedUser;
        this.editMode = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil :', err);
        // Tu peux afficher une notification ici
      }
    });
  }
}

