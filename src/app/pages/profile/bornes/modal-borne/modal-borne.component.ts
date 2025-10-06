import {Component, EventEmitter, Output, ViewChild} from '@angular/core';

import {BorneService} from "../../../../services/borne/borne.service";
import {UserService} from "../../../../services/user/user.service";
import {Lieux, LieuxHttp} from '../../../../entities/lieux.entity';
import {LieuxService} from "../../../../services/lieux/lieux.service";
import {Observable,  take} from "rxjs";
import {BorneDto} from "../../../../entities/borneDto.entity";
import {environment} from "../../../../../environments/environment";
import {User} from "../../../../entities/user.entity";
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-modal-borne',
  templateUrl: './modal-borne.component.html',
  styleUrl: './modal-borne.component.scss'
})
export class ModalBorneComponent {

  private currentUser$: Observable<User | undefined>;
  @Output() onBorneAdded = new EventEmitter<BorneDto>();
  @ViewChild('mainForm') mainForm!: NgForm;
  isOpen = false;
  isEditMode = false;
  imageUrl: string = environment.IMAGE_URL;
  currentUser = this.userService.currentUser;
  file :File | null =null;
  selectedFile: File | null = null;
  attemptedNextStep: boolean = false;
  clientErrorMessage: string | null = null;
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

  // Initialisation avec un user par défaut (valeurs vides)
  borne: BorneDto = {
    id: 0,
    nom: '',
    photo: '',
    puissance: null as any,
    estDisponible: true,
    instruction: '',
    surPied: true,
    prix: null as any,
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

  // Nouveau lieu en cours de création
  newLieu: LieuxHttp = {
    adresse: '',
    codePostal: '',
    ville: '',
    latitude: undefined,
    longitude: undefined
  };

  constructor(
    private userService: UserService, private borneService: BorneService, private lieuxService: LieuxService,) {
    this.currentUser$ = this.userService.currentUser$;
  }

// Méthode simple pour afficher le message
  displayErrorMessage(message: string): void {
    this.clientErrorMessage = message;
  }

  // Méthode pour effacer le message
  clearErrorMessage(): void {
    this.clientErrorMessage = null;
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
    this.loadUserLieux();
    this.photoPreviewUrl = this.borne.photo ? this.imageUrl + this.borne.photo : null;
    this.file = null;
    this.newLieu = {
      adresse: '',
      codePostal: '',
      ville: ''
    };
  }

  open() {
    this.isOpen = true;
    this.loadUserLieux();

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
    this.attemptedNextStep = false;
    this.clearErrorMessage();
  }

  // Validation simple du nouveau lieu
  newLieuIsValid(): boolean {
    return this.newLieu.adresse.trim() !== '' &&
      this.newLieu.ville.trim() !== '' &&
      this.newLieu.codePostal.trim() !== '';
  }

//  "Soit l'un, soit l'autre"
  onLieuIdChange(): void {
    // Si un lieu existant (borne.lieuId > 0) est sélectionné,
    // nous réinitialisons les champs du nouveau lieu.
    if (this.borne.lieuId && this.borne.lieuId > 0) {
      this.newLieu = {
        adresse: '',
        codePostal: '',
        ville: '',
        latitude: undefined,
        longitude: undefined
      };
    }
  }

  validateAndNextStep() {
    // Assurez-vous que mainForm est bien défini
    if (!this.mainForm) {
      console.error("Le formulaire principal n'est pas initialisé.");
      return;
    }

    // NOUVEAU: Marquer la tentative avant la validation
    this.attemptedNextStep = true;
    // 1. Force la validation de TOUS les contrôles du formulaire principal
    // (cela inclut tous les champs du step 1)
    this.mainForm.form.markAllAsTouched();

    // 2. Récupérer l'état de validité spécifique au groupe 'step1Group'
    // C'est l'approche la plus fiable : accéder à l'état du sous-groupe via le formulaire principal
    const step1Group = this.mainForm.controls['step1Group'];

    // 3. Vérification de la photo et de la validité des champs de l'étape
    const photoValid = !this.isPhotoMissing();

    // Vérifier si le groupe existe ET est valide
    if (step1Group && step1Group.valid && photoValid) {
      this.attemptedNextStep = false; // Réinitialiser si succès
      this.step++;
    } else {
      console.warn("Validation Step 1 échouée.");
    }
  }

  onSubmit(form: NgForm) {
    const currentUser = this.userService.currentUser;
    if (!currentUser) {
      console.error('Utilisateur non connecté');
      return;
    }
    this.borne.utilisateurId = currentUser.id;
    this.clearErrorMessage();

    // --- Validation de l'étape 2 ---
    // On marque tous les champs de l'étape 2 comme "touchés" pour afficher les erreurs
    if (this.step === 2) {
      // Si la logique OU n'est pas remplie, le formulaire doit être considéré comme invalide.
      // L'ajout de [required] conditionnel sur les champs aide ici.

      // Si un lieu existant est sélectionné (valide)
      if (this.borne.lieuId && this.borne.lieuId > 0) {
        // C'est valide, on peut soumettre.
      }
      // Si un nouveau lieu est entièrement rempli (valide)
      else if (this.newLieuIsValid()) {
        // C'est valide, on va créer le lieu.
      }
      // Sinon, rien n'est sélectionné ou rempli.
      else {
        // Si le formulaire n'est pas valide selon les règles [required] conditionnelles
        // ou si la logique OU n'est pas satisfaite.
        console.error('Veuillez sélectionner un lieu existant ou remplir tous les champs du nouveau lieu.');
        this.displayErrorMessage('Veuillez sélectionner un lieu existant OU remplir tous les champs du nouveau lieu.'); // 🚨 Affiche le message
        Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
        return;

        // Vous pouvez forcer l'affichage des erreurs du formulaire principal ici si nécessaire
        Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
        return;
      }
    }


    // Si lieu existant sélectionné, on passe directement à la sauvegarde de la borne
    if (this.borne.lieuId && this.borne.lieuId > 0) {
      this.saveBorne();
      return;
    }

    // Si nouveau lieu valide, on crée le lieu d'abord
    if (this.newLieuIsValid()) {
      this.lieuxService.create(this.newLieu).subscribe({
        next: (newLieu) => {
          if (newLieu.id != null) {
            this.borne.lieuId = newLieu.id;
          }
          this.saveBorne();
        },
        error: (err) => {
          //  Gérer l'erreur de géocodage
          console.error('Erreur lors de la création du lieu/géocodage :', err);
          // Ici, vous devez afficher un message explicite à l'utilisateur
          // (ex: "L'adresse saisie n'a pas pu être géocodée. Vérifiez la ville et le code postal.")
          this.displayErrorMessage("L'adresse saisie n'a pas pu être validée. Veuillez vérifier l'adresse, le code postal et la ville.");
        }
      });
      return;
    }

    // Ce cas ne devrait pas être atteint si la validation ci-dessus fonctionne
    console.error('Soumission échouée. Problème de validation du lieu.');
  }



  saveBorne() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user || !user.id) {
        console.error('Utilisateur non connecté');return;}
      this.borne.utilisateurId = user.id;
      const formData = new FormData();
      formData.append('borneDto', JSON.stringify(this.borne));
      if (this.file) {
        formData.append('file', this.file, this.file.name);}
      if (this.isEditMode && this.borne.id) {
        this.borneService.updateBorne(this.borne.id, formData).subscribe({
          next: (borneModifiee) => {
            this.onBorneAdded.emit(borneModifiee);
            this.close();},
          error: (err) => {
            console.error('Erreur lors de la modification de la borne :', err);}});
      } else {
        this.borneService.addBorne(formData).subscribe({
          next: (borneAjoutee) => {
            this.onBorneAdded.emit(borneAjoutee);
            this.close();},
          error: (err) => {
            console.error('Erreur lors de la création de la borne :', err);
          }});}});}


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
      puissance: null as any,
      estDisponible: true,
      instruction: '',
      surPied: true,
      prix: null as any,
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
    this.clearErrorMessage();
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

  isPhotoMissing(): boolean {
    return !this.file && !this.borne.photo;
  }


// méthode pour charger les lieux associés à l'utilisateur
  loadUserLieux(): void {
    this.lieuxExistants = []; // Réinitialise la liste

    const userId = this.userService.currentUser?.id;

    if (!userId) {
      console.error("Utilisateur non connecté : impossible de charger les lieux.");
      return;
    }

    // 1. Récupérer toutes les bornes de l'utilisateur (via BorneService)
    this.borneService.getByUserId(userId).subscribe({
      next: (bornes) => {
        // 2. Extraire les IDs de lieu uniques
        const userLieuIds = new Set<number>(
          bornes
            .map(borne => borne.lieuId) // Mappe vers les IDs de lieu
            .filter(id => id !== null && id > 0) as number[] // Filtre les IDs valides
        );

        // Si l'utilisateur n'a pas encore de lieux associés, on arrête là.
        if (userLieuIds.size === 0) {
          return;
        }

        // 3. Récupérer TOUS les lieux (nécessaire pour obtenir les adresses)
        this.lieuxService.list().subscribe({
          next: (allLieux) => {
            // 4. Filtrer la liste des lieux existants
            this.lieuxExistants = allLieux.filter(lieu =>
              lieu.id && userLieuIds.has(lieu.id)
            );
          },
          error: (err) => console.error("Erreur lors du chargement de TOUS les lieux", err)
        });
      },
      error: (err) => console.error("Erreur lors du chargement des bornes de l'utilisateur", err)
    });
  }

}
