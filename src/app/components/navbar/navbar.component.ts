import {Component, OnInit} from '@angular/core';
import {Location} from "@angular/common";
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {User} from "../../entities/user.entity";
import {map, Observable} from "rxjs";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isConnected: Observable<boolean>; // Utilisation d'un Observable pour suivre l'état de connexion
  currentUser$: Observable<User | undefined>;
  isDropDownCollapse2 = true;
  isMenuCollapsed = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser$;
    this.isConnected = this.currentUser$.pipe(map(user => !!user));

    this.currentUser$.subscribe(user => console.log("Utilisateur courant :", user));
  }


  onClickLogout(): void {
    this.authService.logout();
    this.router.navigate(['connexion']);
  }
}
