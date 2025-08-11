import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {HomeComponent} from "./pages/home/home.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {authGuard} from "./guards/auth/auth.guard";
import {ReservationsComponent} from "./pages/reservations/reservations.component";
import {EmailValidationComponent} from "./components/email-validation/email-validation.component";

const routes: Routes = [
  { path: '', component: HomeComponent }, // page d'accueil par défaut
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'validate-email', component: EmailValidationComponent },
  { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
  { path: 'reservation', canActivate: [authGuard], component: ReservationsComponent },
  { path: '**', redirectTo: '' } // toute URL inconnue → homepage
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
