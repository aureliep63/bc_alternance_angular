import {Component, OnInit} from '@angular/core';
import {filter, Observable, switchMap} from "rxjs";
import {User} from "../../../entities/user.entity";
import {UserService} from "../../../services/user/user.service";
import {AuthService} from "../../../services/auth/auth.service";
import {Router} from "@angular/router";
import {BorneService} from "../../../services/borne/borne.service";

@Component({
  selector: 'app-infos',
  templateUrl: './infos.component.html',
  styleUrl: './infos.component.scss'
})
export class InfosComponent implements OnInit{

  currentUser$:Observable< User | undefined>
  editMode: boolean = false;
  userEditable: Partial<User> = {};
  dateDeNaissanceString: string = '';

  constructor (private userService: UserService) {}

  ngOnInit (): void {
    this.currentUser$ = this.userService.currentUser$;
  }
    enableEdit(currentUser: User): void {
      this.editMode = true;
      // Clone des données pour édition locale
      this.userEditable = { ...currentUser,};
      // Transforme la date en string 'yyyy-MM-dd'
      if (currentUser.dateDeNaissance) {
      const d = new Date(currentUser.dateDeNaissance);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      this.dateDeNaissanceString = `${year}-${month}-${day}`;
    } else {
      this.dateDeNaissanceString = '';
    }
  }

    cancelEdit(): void {
      this.editMode = false;
      this.userEditable = {};
      this.dateDeNaissanceString = '';

    }

    saveEdit(): void {
      if(!
    this.userEditable || !this.userEditable.id
  )
    return;
    if (this.dateDeNaissanceString) {
      this.userEditable.dateDeNaissance = new Date(this.dateDeNaissanceString);
    }
    // Appel à ton service pour mettre à jour l'utilisateur
    this.userService.updateUser(this.userEditable as User).subscribe({
      next: (updatedUser: User) => {
        // Mettre à jour le BehaviorSubject
        this.userService.currentUser = updatedUser;
        this.editMode = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil :', err);
        // Tu peux afficher une notification ici
      }
    });
  }



}
