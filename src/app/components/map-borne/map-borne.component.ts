import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BorneService} from "../../services/borne/borne.service";
import L from 'leaflet';
import 'leaflet-control-geocoder';
import {environment} from "../../../environments/environment.development";

@Component({
  selector: 'app-map-borne',
  templateUrl: './map-borne.component.html',
  styleUrl: './map-borne.component.scss'
})
export class MapBorneComponent implements  AfterViewInit {
  private map!: L.Map;


  constructor(private borneService: BorneService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadBornes();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [45.7305952, 4.836028],
      zoom: 5
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

  }

  private loadBornes(): void {
    this.borneService.list().subscribe(bornes => {
      // 1. Nettoyer les anciens marqueurs
      this.markers.forEach(marker => this.map.removeLayer(marker));
      this.markers = [];

      // 2. Filtrage local (tu peux aussi le faire côté backend si la base est grosse)
      const filtered = bornes.filter(borne => {
        const matchVille = this.filters.ville ?
          borne.lieux?.ville?.toLowerCase().includes(this.filters.ville.toLowerCase()) : true;

        // Si tu veux ajouter un filtrage de dates : compare avec les dispos de la borne
        return matchVille;
      });

      // 3. Afficher les bornes filtrées
      filtered.forEach(borne => {
        const marker = L.marker([borne.latitude, borne.longitude])
          .addTo(this.map)
          .bindPopup(`
            <div class="container p-0">
              <h6 class="text-center"><b>${borne.nom}</b></h6>

              <div class="d-flex flex-row justify-content-center align-items-center" >
                <img src="${environment.IMAGE_URL}${borne.photo}" class="object-fit-cover" style="width: 60px" alt="..." >
                <div class="">
                   <div>
                     <ul style="list-style:none"><i>Adresse:</i>
                        <li>${borne.lieux?.adresse}</li>
                        <li>${borne.lieux?.ville}, ${borne.lieux?.codePostal} </li>
                     </ul>
                     <ul style="list-style:none">
                        <li><i>Latitude:</i> ${borne.latitude}</li>
                        <li><i>Longitude:</i> ${borne.longitude}</li>
                     </ul>
                   </div>
                </div>
               </div>
                <p>${borne.instruction}</p>
                <ul style="list-style:none" class="p-0 mb-1" ><i>Disponible aux dates choisies:</i>
                        <li class="d-flex flex-row align-items-center justify-content-around " style="font-size:small">
                            <label for="start-${borne.id}">Début:</label>
                            <input type="datetime-local" id="start-${borne.id}" class="form-control mb-2" style="font-size:small; width: 55%;"/>
                        </li>
                        <li class="d-flex flex-row align-items-center justify-content-around ">
                            <label for="end-${borne.id}">Fin:</label>
                             <input type="datetime-local" id="end-${borne.id}" class="form-control mb-1" style="font-size:small; width: 55%;"/>
                        </li>
                     </ul>
                <button type="submit" class="btn btn-outline-secondary btn-sm">Réserver</button>
            </div>
`);

        this.markers.push(marker);
      });
    });
  }

  searchBornes(): void {
    this.loadBornes();
  }

  filters = {
    ville: '',
    dateDebut: '',
    dateFin: ''
  };

  private markers: L.Marker[] = []; // Pour pouvoir les supprimer avant d’en recharger


}
