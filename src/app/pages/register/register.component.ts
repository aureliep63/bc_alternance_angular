import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import {UserService} from "../../services/user/user.service";
import {UserHttp} from "../../entities/user.entity";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', Validators.required],
      telephone: [''],
      dateDeNaissance: [''],
      nomRue: [''],
      codePostal: [''],
      ville: ['']
    }, { validator: this.passwordMatchValidator });

    // Ajoutez un listener pour voir les changements de statut du formulaire
    this.registrationForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status); // 'VALID' ou 'INVALID'
      console.log('Form Errors:', this.registrationForm.errors); // Erreurs au niveau du groupe (ex: mismatch password)
      console.log('Form Controls:', this.registrationForm.controls); // État de chaque contrôle
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('motDePasse')?.value === form.get('confirmMotDePasse')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    console.log('onSubmit() called'); // <-- Vérifiez si cette ligne apparaît dans la console
    console.log('Form is valid:', this.registrationForm.valid); // <-- Vérifiez la validité

    if (this.registrationForm.valid) {
      console.log('Form data to send:', this.registrationForm.value); // <-- Affichez les données

      const userToRegister = { ...this.registrationForm.value };
      delete userToRegister.confirmMotDePasse;

      if (userToRegister.dateDeNaissance) {
        userToRegister.dateDeNaissance = new Date(userToRegister.dateDeNaissance).toISOString().split('T')[0];
      }

    

      this.authService.register(userToRegister).subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);
          alert('Inscription réussie ! Un e-mail de validation a été envoyé.');
          // ATTENTION : Si vous avez une ligne comme celle-ci, elle peut être la cause de la redirection immédiate.
          // this.router.navigate(['/login']); // <-- Supprimez ou commentez temporairement cette ligne
        },
        error: (error) => {
          console.error('Erreur lors de l\'inscription', error);
          alert('Erreur lors de l\'inscription : ' + (error.error?.message || 'Veuillez réessayer.'));
        }
      });
    } else {
      console.warn('Form is invalid, marking all fields as touched.');
      this.registrationForm.markAllAsTouched();
    }
  }
}
