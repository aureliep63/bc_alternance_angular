import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { LoginComponent } from './pages/login/login.component';
import {NgbCollapseModule, NgbModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule, provideHttpClient, withInterceptors} from "@angular/common/http";
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import {authInterceptor} from "./interceptors/auth/auth.interceptor";
import { ProfileComponent } from './pages/profile/profile.component';
import { RoleUserComponent } from './components/reservationsProproLoca/reservationsProprioLoca.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { ModalBorneComponent } from './components/modal-borne/modal-borne.component';
import { Section1MapComponent } from './pages/home/section1Map/section1Map.component';
import { CarrousselComponent } from './components/layout/carroussel/carroussel.component';
import { ModalBorneDetailComponent } from './components/modal-borne-detail/modal-borne-detail.component';
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
import { Section3MarcheComponent } from './pages/home/section3Marche/section3Marche.component';
import {Section2SituationComponent} from "./pages/home/section2Situation/section2Situation.component";
import { Section4MarcheProprioComponent } from './pages/home/section4-marche-proprio/section4-marche-proprio.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { BorneDetailComponent } from './pages/home/section1Map/borne-detail/borne-detail.component';


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
    Section1MapComponent,
    CarrousselComponent,
    ModalBorneDetailComponent,
    EmailValidationComponent,
    Section2SituationComponent,
    Section3MarcheComponent,
    Section4MarcheProprioComponent,
    FooterComponent,
    BorneDetailComponent
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
