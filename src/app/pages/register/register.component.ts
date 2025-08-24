import {Component, OnInit, ViewChild, inject, Optional} from '@angular/core';
import {AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import {UserService} from "../../services/user/user.service";
import {UserHttp} from "../../entities/user.entity";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {map, Observable, of, switchMap, timer} from "rxjs";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoginComponent} from "../login/login.component";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {

  firstFormGroup!: FormGroup; // Informations personnelles
  secondFormGroup!: FormGroup; // Adresse
  thirdFormGroup!: FormGroup; // Paiement (simulé)
  fourthFormGroup!: FormGroup; //  password + recap
  validationFormGroup!: FormGroup; // Nouveau FormGroup pour le code de validation
  attemptsLeft = 3;
  resendMessage: string | null = null; // Property to store the resend message
  isResendError: boolean = false; // Flag to check if the message is an error
  isLinear = false;
  isModal: boolean = false;
  requestOngoing = false;
  isMobile = false;
  isOpen = false;
  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    @Optional() private dialogRef: MatDialogRef<RegisterComponent>
  ) {  this.isModal = !!this.dialogRef;}

  ngOnInit(): void {
    // Étape 1 : Informations personnelles
    this.firstFormGroup = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateDeNaissance: [''], // La validation est souvent gérée côté back-end pour les dates
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.emailExistsValidator()],
        updateOn: 'blur'
      }],
      telephone: ['', [Validators.required]] // Ajout de la validation requise
    });

    // Étape 2 : Adresse
    this.secondFormGroup = this.fb.group({
      nomRue: ['', Validators.required],
      codePostal: ['', [Validators.required, Validators.pattern('\\d{5}')]],
      ville: ['', Validators.required]
    });

    // Étape 3 : Paiement (simulé, pas de FormControls nécessaires)
    this.thirdFormGroup = this.fb.group({});
    // Étape 4 : Mot de passe & Récapitulatif
    this.fourthFormGroup = this.fb.group({
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    this.validationFormGroup = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: any): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return timer(500).pipe( // Ajoute un délai pour éviter trop de requêtes
        switchMap(() => this.authService.checkEmailExists(control.value)),
        map(exists => (exists ? { emailExists: true } : null))
      );
    };
  }

  // Validateur pour la correspondance des mots de passe
  passwordMatchValidator(form: FormGroup) {
    return form.get('motDePasse')?.value === form.get('confirmMotDePasse')?.value
      ? null : { mismatch: true };
  }
  // Nouvelle méthode pour envoyer le code et enregistrer l'utilisateur
  // Cette méthode est appelée quand l'utilisateur clique sur "S'inscrire" à l'étape 4
  sendVerificationCode(): void {
    const registrationData = {
      ...this.firstFormGroup.value,
      ...this.secondFormGroup.value,
      ...this.fourthFormGroup.value
    };

    // Convertir la date
    if (registrationData.dateDeNaissance) {
      registrationData.dateDeNaissance = new Date(registrationData.dateDeNaissance).toISOString().split('T')[0];
    }

    // Appel du service pour enregistrer l'utilisateur (le back-end envoie l'email de validation)
    this.authService.register(registrationData).subscribe({
      next: (response) => {
        console.log('Inscription réussie, email de validation envoyé', response);
        // Le stepper passera automatiquement à l'étape suivante si le formulaire est valide.
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription', error);
        alert('Erreur lors de l\'inscription : ' + (error.error?.message || 'Veuillez réessayer.'));
      }
    });
  }



  // Méthode appelée lors du clic sur le bouton "Valider"
  validateEmail(): void {
    const code = this.validationFormGroup.get('code')?.value;
    const email = this.firstFormGroup.get('email')?.value;

    if (this.validationFormGroup.invalid || this.attemptsLeft <= 0) {
      this.validationFormGroup.markAllAsTouched();
      return;
    }

    this.authService.validateEmail(email, code).subscribe({
      next: (response) => {
        console.log('Validation réussie', response);
        // Ici, tu peux passer à la dernière étape du stepper
        this.stepper.next();
      },
      error: (error) => {
        console.error('Erreur de validation', error);
        this.attemptsLeft--;

        if (this.attemptsLeft > 0) {
          // Afficher l'erreur sous l'input
          this.validationFormGroup.get('code')?.setErrors({ 'apiError': 'Le code est invalide. Veuillez réessayer.' });
        } else {
          // Gérer le cas où toutes les tentatives ont été utilisées
          this.validationFormGroup.get('code')?.disable();
        }
      }
    });
  }

  // Méthode pour renvoyer un nouveau code
  resendCode(): void {
    const email = this.firstFormGroup.get('email')?.value;

    this.authService.resendValidationCode(email).subscribe({
      next: () => {
        // On success, set the message and reset state
        this.resendMessage = 'Un nouveau code a été envoyé à votre adresse e-mail.';
        this.isResendError = false;
        this.attemptsLeft = 3;
        this.validationFormGroup.get('code')?.reset();
        this.validationFormGroup.get('code')?.enable();
      },
      error: (err) => {
        // On error, set the message and error flag
        console.error('Erreur lors de l\'envoi du code.', err);
        this.resendMessage = 'Erreur lors de l\'envoi du code. Veuillez réessayer.';
        this.isResendError = true;
      }
    });
  }

  openLogin() {
    console.log('Is mobile? ', this.isMobile);
    if (this.isMobile) {
      // Navigue vers la page de connexion pour les mobiles
      this.router.navigate(['/login']);
    } else {
      // Ouvre une modale pour les versions desktop
      this.dialog.open(LoginComponent, {
        width: '1200px',
        height:'650px',
        panelClass: 'login-modal-panel'
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
