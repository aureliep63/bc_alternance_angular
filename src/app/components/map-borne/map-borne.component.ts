import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BorneService} from "../../services/borne/borne.service";
import 'leaflet-control-geocoder';
import {environment} from "../../../environments/environment.development";

import * as L from 'leaflet';
import {ReservationService} from "../../services/reservation/reservation.service";
import {setHours, setMinutes, toDate} from "date-fns";
import {LieuxService} from "../../services/lieux/lieux.service";

// Fix des icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
const defaultIcon = new L.Icon.Default();
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});
const unavailableIcon = L.icon({
  iconUrl: 'assets/leaflet/marker-unavailable.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

@Component({
  selector: 'app-map-borne',
  templateUrl: './map-borne.component.html',
  styleUrl: './map-borne.component.scss'
})
export class MapBorneComponent implements  AfterViewInit {
  private map!: L.Map;
  bornes: any[] = [];

  filters = {
    ville: '',
    dateDebut: '',
    heureDebut:'',
    dateFin: '',
    heureFin:''
  };

  private markers: L.Marker[] = [];
  constructor(private borneService: BorneService, private reservationService: ReservationService, private lieuxService: LieuxService) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.borneService.list().subscribe({
      next: (bornes) => {
        this.bornes = bornes;
        this.updateMap(bornes);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des bornes', err);
      }
    });
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

  private updateMap(bornes: any[]): void {
    // Supprimer anciens markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    bornes.forEach(borne => {
      const lat = borne.lieux?.latitude;
      const lon = borne.lieux?.longitude;


      if (lat && lon) {
        const marker = L.marker([lat, lon])
          .addTo(this.map)
          .bindPopup(`
          <div class="container p-0">
            <h6 class="text-center"><b>${borne.nom}</b></h6>
            <div class="d-flex flex-row justify-content-center align-items-center">
              <img src="${environment.IMAGE_URL}${borne.photo}" class="object-fit-cover" style="width: 60px" alt="...">
              <div>
                <ul style="list-style:none"><i>Adresse:</i>
                  <li>${borne.lieux?.adresse}</li>
                  <li>${borne.lieux?.ville}, ${borne.lieux?.codePostal}</li>
                </ul>
              </div>
            </div>
            <p>${borne.instruction}</p>
          </div>
        `);

        this.markers.push(marker);
      } else {
        console.warn(`Borne ${borne.nom} n'a pas de coordonnées valides.`);
      }
    });
  }



  searchBornes() {

    let dateDebut = toDate(this.filters.dateDebut);
    const [hours, minutes] = this.filters.heureDebut.split(":");
    // dateDebut -> heuredebut -> minDebut
    let heureDebut = setHours(dateDebut, Number(hours));
    let minDebut = setMinutes(heureDebut, Number(minutes)) || null;

    let dateFin = toDate(this.filters.dateFin);
    const [hoursFin, minutesFin] = this.filters.heureFin.split(":");
    let heureFin = setHours(dateFin, Number(hoursFin));
    let minFin = setMinutes(heureFin, Number(minutesFin))  || null;


    const filtresNettoyes = {
      ville: this.filters.ville?.trim() || null,
      dateDebut: minDebut || null,
      dateFin: minFin || null,

    };

    this.borneService.searchBornes(filtresNettoyes).subscribe({
      next: (bornes) => {
        this.bornes = bornes;
        this.updateMap(bornes);
      },
      error: (err) => {
        console.error('Erreur lors de la recherche des bornes', err);
      }
    });
    console.log('Filtres envoyés:', filtresNettoyes);
  }

}
