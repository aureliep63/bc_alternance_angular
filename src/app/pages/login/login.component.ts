import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";

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

  // injection de dépendance, soit le singleton existe donc on récup l'instance, soit existe pas donc on génère une instance (donc une factory)
  constructor(private authService:AuthService, private router:Router) {
  }

  ngOnInit() {
    this.initForm()
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
      this.router.navigateByUrl('/profile')
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

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }


}

