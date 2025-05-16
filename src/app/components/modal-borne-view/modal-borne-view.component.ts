import {Component, Input} from '@angular/core';
import {BorneDto} from "../../entities/borneDto.entity";
import {environment} from "../../../environments/environment.development";

@Component({
  selector: 'app-modal-borne-view',
  templateUrl: './modal-borne-view.component.html',
  styleUrl: './modal-borne-view.component.scss'
})
export class ModalBorneViewComponent {
  @Input() borne?: BorneDto;
  imageUrl = environment.IMAGE_URL;
  isOpen = false;

  open(borne: BorneDto) {
    this.borne = borne;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

}
