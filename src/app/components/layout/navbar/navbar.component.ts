import {Component, OnInit} from '@angular/core';
import {Location} from "@angular/common";
import {UserService} from "../../../services/user/user.service";
import {AuthService} from "../../../services/auth/auth.service";
import {Router} from "@angular/router";
import {User} from "../../../entities/user.entity";
import {map, Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {LoginComponent} from "../../../pages/login/login.component";
import {MatDialog} from "@angular/material/dialog";

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
  isMobile = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,

  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser$;
    this.isConnected = this.currentUser$.pipe(map(user => !!user));

    this.currentUser$.subscribe(user => console.log("Utilisateur courant :", user));

    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }


  onClickLogout(): void {
    this.authService.logout();
    this.router.navigate(['connexion']);
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
    }
  }
}
