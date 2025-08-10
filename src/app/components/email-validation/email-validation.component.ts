import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-email-validation',
  templateUrl: './email-validation.component.html',
  styleUrl: './email-validation.component.scss'
})
export class EmailValidationComponent implements OnInit {
  validationMessage: string = 'Validation en cours...';
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.validateEmail(token).subscribe({
          next: (response) => {
            this.validationMessage = 'Votre compte a été validé avec succès ! Vous pouvez maintenant vous connecter.';
            this.isSuccess = true;
            // Optionnel: Rediriger après quelques secondes
            setTimeout(() => {
              this.router.navigate(['/login']); // Rediriger vers votre page de connexion
            }, 3000);
          },
          error: (error) => {
            this.validationMessage = 'Échec de la validation : ' + (error.error?.message || 'Token invalide ou expiré.');
            this.isSuccess = false;
          }
        });
      } else {
        this.validationMessage = 'Aucun token de validation trouvé.';
        this.isSuccess = false;
      }
    });
  }
}
