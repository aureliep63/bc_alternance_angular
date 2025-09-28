import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ViewportScroller} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',

})
export class ProfileComponent implements OnInit{

  activeTab: string = 'infos';


  constructor (private route: ActivatedRoute,
               private scroller: ViewportScroller) {}

  ngOnInit (): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.handleFragmentNavigation(fragment);
      }
    });
  }

  handleFragmentNavigation(fragment: string): void {
    let targetTab: string | null = null;

    if (fragment.startsWith('resa')) {
      targetTab = 'resa';
    } else if (fragment === 'ajoutBorne') {
      targetTab = 'bornes';
    }

    if (targetTab) {
      this.setActiveTab(targetTab); // 1. Active l'onglet cible

      // 2. Défile après un micro-délai pour que le composant soit rendu dans le DOM
      setTimeout(() => {
        // Utilise le ViewportScroller pour défiler vers l'ID cible
        this.scroller.scrollToAnchor('resaProfil');
      }, 50);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }



}

