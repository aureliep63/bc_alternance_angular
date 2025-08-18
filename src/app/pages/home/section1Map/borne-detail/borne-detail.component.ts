import {Component, Input} from '@angular/core';
import {BorneDto} from "../../../../entities/borneDto.entity";
import {environment} from "../../../../../environments/environment";
import {setHours, setMinutes, toDate} from "date-fns";

@Component({
  selector: 'app-borne-detail',
  templateUrl: './borne-detail.component.html',
  styleUrl: './borne-detail.component.scss'
})
export class BorneDetailComponent {
  @Input() borne?: BorneDto;
  imageUrl = environment.IMAGE_URL;
  isOpen = false;
  activeTab: string = 'infos';

  filters = {
    ville: '',
    dateDebut: '',
    heureDebut:'',
    dateFin: '',
    heureFin:''
  };



  open(borne: BorneDto) {
    this.borne = borne;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
