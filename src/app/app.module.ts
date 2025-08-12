import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './pages/login/login.component';
import {NgbCollapseModule, NgbModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule, provideHttpClient, withInterceptors} from "@angular/common/http";
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import {authInterceptor} from "./interceptors/auth/auth.interceptor";
import { ProfileComponent } from './pages/profile/profile.component';
import { RoleUserComponent } from './components/role-user/role-user.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { ModalBorneComponent } from './components/modal-borne/modal-borne.component';
import { MapBorneComponent } from './components/map-borne/map-borne.component';
import { CarrousselComponent } from './components/carroussel/carroussel.component';
import { ModalBorneViewComponent } from './components/modal-borne-view/modal-borne-view.component';
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatTabsModule} from "@angular/material/tabs";
import {MatStepperModule} from "@angular/material/stepper";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import {environment} from "../environments/environment";
import {EmailValidationComponent} from "./components/email-validation/email-validation.component";


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    RoleUserComponent,
    ReservationsComponent,
    ModalBorneComponent,
    MapBorneComponent,
    CarrousselComponent,
    ModalBorneViewComponent,
    EmailValidationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgbCollapseModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbTimepickerModule,
    NgxMaterialTimepickerModule,
    NgxMaterialTimepickerModule.setOpts('fr-FR'),
    BrowserAnimationsModule,
    MatTabsModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),



  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule { }
