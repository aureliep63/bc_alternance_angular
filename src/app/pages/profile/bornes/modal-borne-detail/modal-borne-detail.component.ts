import {Component, Input} from '@angular/core';
import {BorneDto} from "../../../../entities/borneDto.entity";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-modal-borne-detail',
  templateUrl: './modal-borne-detail.component.html',
  styleUrl: './modal-borne-detail.component.scss'
})
export class ModalBorneDetailComponent {
  @Input() borne?: BorneDto;
  imageUrl = environment.IMAGE_URL;
  isOpen = false;
  activeTab: string = 'infos';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  open(borne: BorneDto) {
    this.borne = borne;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

}
