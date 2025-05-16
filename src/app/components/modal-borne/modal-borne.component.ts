import {Component, EventEmitter, Output} from '@angular/core';
import {Borne} from "../../entities/borne.entity";
import {AuthService} from "../../services/auth/auth.service";
import {BorneService} from "../../services/borne/borne.service";
import {UserService} from "../../services/user/user.service";
import { Lieux } from '../../entities/lieux.entity';
import {LieuxService} from "../../services/lieux/lieux.service";
import {BehaviorSubject, filter, Observable, switchMap, take} from "rxjs";
import {BorneDto} from "../../entities/borneDto.entity";
import {environment} from "../../../environments/environment.development";
import {User} from "../../entities/user.entity";


@Component({
  selector: 'app-modal-borne',
  templateUrl: './modal-borne.component.html',
  styleUrl: './modal-borne.component.scss'
})
export class ModalBorneComponent {
  isOpen = false;
  isEditMode = false;
  imageUrl: string = environment.IMAGE_URL;

  photoPreviewUrl: string | null = null;
  step = 1;
  lieuxExistants: Lieux[] = [];
  currentUser = this.userService.currentUser;
  file :File | null =null;
  // Initialisation avec un user par défaut (valeurs vides)
  borne: BorneDto = {
    id: 0,
    nom: '',
    photo: '',
    puissance: 0,
    estDisponible: true,
    instruction: '',
    surPied: true,
    latitude: 0,
    longitude: 0,
    prix: 0,
    mediasId: [],
    reservationsId: [],
    utilisateurId: this.currentUser ? this.currentUser.id : 0,
    lieuId: 0,
    lieux: {
      id: 0,
      adresse: '',
      codePostal: '',
      ville: ''
    }
  };
  private currentUser$: Observable<User | undefined>;

  @Output() onBorneAdded = new EventEmitter<BorneDto>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private borneService: BorneService,
    private lieuxService: LieuxService,
  ) {
    this.currentUser$ = this.userService.currentUser$;

  }


  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  open() {
    this.isOpen = true;

    this.lieuxService.list().subscribe({
      next: (lieux) => {
        this.lieuxExistants = lieux;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des lieux", err);
      }
    });
  }

  close() {
    this.isOpen = false;
    this.isEditMode = false;
    this.resetForm();
  }


  onSubmit() {
    const currentUser = this.userService.currentUser;

    if (!currentUser) {
      console.error('Utilisateur non connecté');
      return;
    }

    // Si un lieu existant est sélectionné
    if (this.borne.lieuId != null && this.borne.lieuId > 0) {
      this.borne.lieux = null;
      this.saveBorne();
      return;
    }

    // Si un nouveau lieu est créé
    if (this.borne.lieux?.adresse && this.borne.lieux?.ville && this.borne.lieux?.codePostal) {
      this.lieuxService.create(this.borne.lieux).subscribe({
        next: (newLieu) => {
          console.log('Nouveau lieu créé avec succès', newLieu);
          this.borne.lieuId = newLieu.id;
          // Ici, on émet la borne ajoutée pour que le parent mette à jour la liste

          this.saveBorne();
        },
        error: (err) => {
          console.error('Erreur lors de la création du lieu :', err);
        }
      });
      return; // On ne continue pas avant que le lieu soit créé
    }

    // Aucun lieu sélectionné ni créé
    console.error('Aucun lieu sélectionné ou créé');
  }


  saveBorne() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user || !user.id) {
        console.error('Utilisateur non connecté');
        return;
      }

      this.borne.utilisateurId = user.id;

      const formData = new FormData();
      formData.append('borneDto', JSON.stringify(this.borne)); // ✅ revenir à ça

      if (this.file) {
        formData.append('file', this.file, this.file.name);   // ✅ garder ça
      }

      if (this.isEditMode && this.borne.id) {
        this.borneService.updateBorneWithFile(this.borne.id, formData).subscribe({
          next: (borneModifiee) => {
            this.onBorneAdded.emit(borneModifiee);
            this.close();
          },
          error: (err) => {
            console.error('Erreur lors de la modification de la borne :', err);
          }
        });
      } else {
        this.borneService.addBorneWithFile(formData).subscribe({
          next: (borneAjoutee) => {
            this.onBorneAdded.emit(borneAjoutee);
            this.close();
          },
          error: (err) => {
            console.error('Erreur lors de la création de la borne :', err);
          }
        });
      }
    });
  }


  nextStep() {
    this.step++;
  }

  previousStep() {
    this.step--;
  }

  resetForm() {
    const currentUser = this.userService.currentUser;
    this.borne = {
      id: 0,
      nom: '',
      photo: '',
      puissance: 0,
      estDisponible: true,
      instruction: '',
      surPied: true,
      latitude: 0,
      longitude: 0,
      prix: 0,
      mediasId: [],
      reservationsId: [],
      utilisateurId: currentUser ? currentUser.id : 0,
      lieuId: 0,
      lieux: {
        id: 0,
        adresse: '',
        codePostal: '',
        ville: ''
      }
    };

    this.step = 1;
    this.photoPreviewUrl = null;   // ✅ Ajoute ceci
    this.file = null;              // ✅ (et ça si tu utilises 'file' ailleurs)
  }



  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.file = file; // conserve pour l'upload

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreviewUrl = e.target.result; // Preview temporaire
      };
      reader.readAsDataURL(file);
    }
  }



  openForEdit(borne: BorneDto) {
    this.isOpen = true;
    this.isEditMode = true;
    this.step = 1;

    // Cloner en premier
    this.borne = JSON.parse(JSON.stringify(borne));

    // Charger les lieux existants
    this.lieuxService.list().subscribe({
      next: (lieux) => {
        this.lieuxExistants = lieux;
      }
    });

    // Préparer la structure si lieu est null
    if (!this.borne.lieux) {
      this.borne.lieux = {
        id: 0,
        adresse: '',
        codePostal: '',
        ville: ''
      };
    }

    // Afficher l'image existante si pas de nouvelle sélection
    this.photoPreviewUrl = this.borne.photo ? this.imageUrl + this.borne.photo : null;

    this.file = null;
  }



}
