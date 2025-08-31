import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {BorneService} from "../../services/borne/borne.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',

})
export class ProfileComponent implements OnInit{

  activeTab: string = 'infos';


  constructor (private userService: UserService,
               private authService: AuthService,
               private router:Router,
               private borneService: BorneService) {}

  ngOnInit (): void {

  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }



}

