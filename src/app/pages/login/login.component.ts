import {Component, OnInit, Optional} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {RegisterComponent} from "../register/register.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

// un reactive form est composé d'un form groupe qui est unn groupe de formControl (champs de formulaire) et/ouo formGroup
  form:FormGroup
  errorMsg?:string
  requestOngoing = false // requete en cours (si on clique plusieurs fois sur le btn submit
  isModal: boolean = false;
  isMobile = false;
  isOpen = false;
  showPassword: boolean = false;

  // injection de dépendance, soit le singleton existe donc on récup l'instance, soit existe pas donc on génère une instance (donc une factory)
  constructor(
    private authService: AuthService,
    private router: Router,
    // Rend MatDialogRef optionnel pour éviter l'erreur de dépendance
    @Optional() private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {
    // Si dialogRef est défini, cela signifie que le composant est dans une modale
    this.isModal = !!this.dialogRef;
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      remember: new FormControl(false)
    });
  }

  ngOnInit() {
    this.initForm()
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  async onSubmitlogin():Promise<void>{
    //si c'est invalide tu ne continu pas la fonction
    if(this.form.invalid || this.requestOngoing) return
    const {email, password, remember} = this.form.value
    this.errorMsg = undefined
    this.requestOngoing = true

    try{
      console.log('on rentre ds le try')
      await this.authService.login(email, password, remember)
      if (this.dialogRef) {
        this.dialogRef.close();
      }
      this.router.navigateByUrl('/profile');
    }catch (e:any){
      // if else en one Line
      if(e.status === 401) this.errorMsg = 'Email ou mot de passe incorrect'
      else this.errorMsg = 'Une erreur est survenue.Veuillez réessayer plus tard.'
    }

    this.requestOngoing = false
  }


  private initForm(){
    this.form = new FormGroup({
      email:new FormControl('',[Validators.required, Validators.email]),
      password:new FormControl('',[Validators.required, Validators.minLength(3)]),
      remember:new FormControl(false)
    })
  }



  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  openRegister() {
    console.log('Is mobile? ', this.isMobile);
    if (this.isMobile) {
      // Navigue vers la page de connexion pour les mobiles
      this.router.navigate(['/register']);
    } else {
      // Ouvre une modale pour les versions desktop
      this.dialog.open(RegisterComponent, {
        width: '1100px',
        height:'auto',
        panelClass: 'register-modal-panel'

      }
      );
      this.dialogRef.close();
    }

  }

  close(): void {
    this.dialogRef.close();
  }
}

