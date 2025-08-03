import {Component, EventEmitter, Output} from '@angular/core';
import {Borne} from "../../entities/borne.entity";
import {AuthService} from "../../services/auth/auth.service";
import {BorneService} from "../../services/borne/borne.service";
import {UserService} from "../../services/user/user.service";
import {Lieux, LieuxHttp} from '../../entities/lieux.entity';
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
  lieuxExistants: {
    id: number | undefined;
    adresse: string;
    codePostal: string;
    ville: string;
    latitude: number | undefined;
    longitude: number | undefined
  }[] = [];
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
    prix: 0,
    mediasId: [],
    reservationsId: [],
    utilisateurId: this.currentUser ? this.currentUser.id : 0,
    lieuId: 0,
    lieux: { // Initialisation de l'objet lieux
      id: undefined ,
      adresse: '',
      codePostal: '',
      ville: '',
      latitude: undefined ,
      longitude: undefined ,
    },
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

  // Nouveau lieu en cours de création
  newLieu: LieuxHttp = {
    adresse: '',
    codePostal: '',
    ville: '',
    latitude: undefined,
    longitude: undefined
  };

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

  // Validation simple du nouveau lieu
  newLieuIsValid(): boolean {
    return this.newLieu.adresse.trim() !== '' &&
      this.newLieu.ville.trim() !== '' &&
      this.newLieu.codePostal.trim() !== '';
  }



  onSubmit() {
    const currentUser = this.userService.currentUser;
    if (!currentUser) {
      console.error('Utilisateur non connecté');
      return;
    }
    this.borne.utilisateurId = currentUser.id;

    // Si lieu existant sélectionné
    if (this.borne.lieuId && this.borne.lieuId > 0) {
      this.saveBorne();
      return;
    }

    // Sinon, si nouveau lieu valide
    if (this.newLieuIsValid()) {
      this.lieuxService.create(this.newLieu).subscribe({ // Passez l'objet newLieu ici
        next: (newLieu) => {
          if (newLieu.id != null) {
            this.borne.lieuId = newLieu.id;
          }
          this.saveBorne(); // Appelez saveBorne après avoir créé le lieu
        },
        error: (err) => {
          console.error('Erreur lors de la création du lieu :', err);
        }
      });
      return;
    }
    console.error('Aucun lieu sélectionné ou nouveau lieu valide');
  }


  saveBorne() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user || !user.id) {
        console.error('Utilisateur non connecté');
        return;
      }

      this.borne.utilisateurId = user.id;

      const formData = new FormData();
      formData.append('borneDto', JSON.stringify(this.borne));

      if (this.file) {
        formData.append('file', this.file, this.file.name);
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
      prix: 0,
      mediasId: [],
      reservationsId: [],
      utilisateurId: currentUser ? currentUser.id : 0,
      lieuId: 0,

    };

    this.newLieu = {
      adresse: '',
      codePostal: '',
      ville: ''
    };
    this.step = 1;
    this.photoPreviewUrl = null;
    this.file = null;
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

    this.borne = JSON.parse(JSON.stringify(borne));

    this.lieuxService.list().subscribe({
      next: (lieux) => this.lieuxExistants = lieux,
      error: (err) => console.error("Erreur chargement lieux en édition", err)
    });

    this.photoPreviewUrl = this.borne.photo ? this.imageUrl + this.borne.photo : null;
    this.file = null;

    // Reset newLieu si besoin
    this.newLieu = {
      adresse: '',
      codePostal: '',
      ville: ''
    };
  }




}
