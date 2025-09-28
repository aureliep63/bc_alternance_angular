import {Component, OnInit, ViewChild, inject, Optional} from '@angular/core';
import {AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
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
import {formatDate} from "@angular/common";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  value = 'Clear me';
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
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  codeControls: string[] = ['digit0', 'digit1', 'digit2', 'digit3', 'digit4', 'digit5'];
  emailValidated = false;

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
    this.thirdFormGroup = this.fb.group({
      paypal: ['', Validators.email],
      cbNumber: ['', Validators.pattern(/^\d{16}$/)], // 16 chiffres
      cbDate: [''],
      cbCvv: ['', Validators.pattern(/^\d{3}$/)], // 3 chiffres
      googlePay: ['', Validators.email]
    }, { validators: [paymentMethodValidator] });
    // Étape 4 : Mot de passe & Récapitulatif
    this.fourthFormGroup = this.fb.group({
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]).subscribe(result => {
      this.isMobile = result.matches;
    });

    this.codeControls = ['digit0', 'digit1', 'digit2', 'digit3', 'digit4', 'digit5'];
    const group: any = {};
    this.codeControls.forEach(ctrl => {
      group[ctrl] = ['', [Validators.required, Validators.pattern('\\d')]];
    });
    this.validationFormGroup = this.fb.group(group);

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
    const code = this.codeControls.map(c => this.validationFormGroup.get(c)?.value).join('');
    const email = this.firstFormGroup.get('email')?.value;

    if (this.validationFormGroup.invalid || this.attemptsLeft <= 0) {
      this.validationFormGroup.markAllAsTouched();
      return;
    }

    this.authService.validateEmail(email, code).subscribe({
      next: (response) => {
        console.log('Validation réussie', response);
        this.emailValidated = true;
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
      this.dialogRef.close();
    }
  }

  close(): void {
    const email = this.firstFormGroup.get('email')?.value;
    if (!this.emailValidated) {
      this.authService.deleteUnverifiedUser(email).subscribe({
        next: () => console.log('Utilisateur non validé supprimé'),
        error: (err) => console.error('Erreur suppression utilisateur', err)
      });
    }
    this.dialogRef.close();
  }




  moveFocus(event: any, index: number) {
    const input = event.target as HTMLInputElement;

    // Supprime tout ce qui n'est pas chiffre
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length >= 1 && index < this.codeControls.length - 1) {
      const nextInput = input.parentElement?.parentElement?.querySelectorAll('input')[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  prevFocus(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.value && index > 0) {
      const prevInput = input.parentElement?.parentElement?.querySelectorAll('input')[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  getCode(): string {
    return this.codeControls.map(c => this.validationFormGroup.get(c)?.value).join('');
  }

}

export function paymentMethodValidator(control: AbstractControl): ValidationErrors | null {
  const paypalCtrl = control.get('paypal');
  const googlePayCtrl = control.get('googlePay');
  const cbNumberCtrl = control.get('cbNumber');
  const cbDateCtrl = control.get('cbDate');
  const cbCvvCtrl = control.get('cbCvv');

  const hasValidPaypal = paypalCtrl?.value?.trim() && !paypalCtrl.errors;
  const hasValidGooglePay = googlePayCtrl?.value?.trim() && !googlePayCtrl.errors;
  const hasCard = cbNumberCtrl?.value?.trim() && cbDateCtrl?.value?.trim() && cbCvvCtrl?.value?.trim()
    && !cbNumberCtrl?.errors && !cbDateCtrl?.errors && !cbCvvCtrl?.errors;

  if (hasValidPaypal || hasValidGooglePay || hasCard) {
    return null;
  }
  return { noPayment: true };
}
