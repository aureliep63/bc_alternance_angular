import {Component, OnInit, Optional} from '@angular/core';
import {RegisterComponent} from "../../register/register.component";
import {AuthService} from "../../../services/auth/auth.service";
import {Router} from "@angular/router";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {LoginComponent} from "../../login/login.component";
import {map, Observable} from "rxjs";
import {User} from "../../../entities/user.entity";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-section3Marche',
  templateUrl: './section3Marche.component.html',
  styleUrl: './section3Marche.component.scss'
})
export class Section3MarcheComponent  implements OnInit{
  isMobile = false;
  isModal: boolean = false;
  form:FormGroup
  isConnected: Observable<boolean>;
  currentUser$: Observable<User | undefined>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    @Optional() private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isModal = !!this.dialogRef;
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      remember: new FormControl(false)
    });
  }

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
