import {Component, OnInit} from '@angular/core';
import {User} from "../../entities/user.entity";
import {filter, Observable, switchMap} from "rxjs";
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {Borne} from "../../entities/borne.entity";
import {BorneService} from "../../services/borne/borne.service";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',

})
export class ProfileComponent implements OnInit{

  currentUser$:Observable< User | undefined>
  currentBorneUser$: Observable<Borne[]>;

  constructor (private userService: UserService,
               private authService: AuthService,
               private router:Router,
               private borneService: BorneService) {}

  ngOnInit (): void {

    this.currentUser$ = this.userService.currentUser$;
    console.log('currentUser$ dans ngOnInit:', this.currentUser$);
    this.currentBorneUser$ = this.currentUser$.pipe(
      filter(user => !!user && !!user.id), // Vérifie que user et user.id existent
      switchMap(user => this.borneService.getByUserId(user!.id))
    );
  }
}
