import {Component, OnInit, Optional} from '@angular/core';
import {map, Observable} from "rxjs";
import {User} from "../../../entities/user.entity";
import {Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {UserService} from "../../../services/user/user.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoginComponent} from "../../../pages/login/login.component";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit{
  isConnected: Observable<boolean>;
  currentUser$: Observable<User | undefined>;
  isMobile = false;
  isModal: boolean = false;
  form:FormGroup

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
