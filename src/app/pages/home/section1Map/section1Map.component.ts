import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BorneService} from "../../../services/borne/borne.service";
import 'leaflet-control-geocoder';
import {environment} from "../../../../environments/environment";

import * as L from 'leaflet';
import {ReservationService} from "../../../services/reservation/reservation.service";
import {setHours, setMinutes, toDate} from "date-fns";
import {LieuxService} from "../../../services/lieux/lieux.service";
import {BorneDto} from "../../../entities/borneDto.entity";
import {ModalBorneDetailComponent} from "../../profile/bornes/modal-borne-detail/modal-borne-detail.component";
import {BorneDetailComponent} from "./borne-detail/borne-detail.component";
import {Borne} from "../../../entities/borne.entity";
import {ModalBorneComponent} from "../../profile/bornes/modal-borne/modal-borne.component";
import {formatDate} from "@angular/common";
import {GeocodingService} from "../../../services/geocoding/geocoding.service";

// Fix des icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
const defaultIcon = new L.Icon.Default();
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/MapMarker_Marker_Inside_Green.png',
  iconUrl: 'assets/leaflet/MapMarker_Marker_Inside_Green.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});
const unavailableIcon = L.icon({
  iconUrl: 'assets/leaflet/MapMarker_Marker_Inside_Pinkxs.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

@Component({
  selector: 'app-section1Map',
  templateUrl: './section1Map.html',
  styleUrl: './section1Map.component.scss'
})
export class Section1MapComponent implements  AfterViewInit {
  @ViewChild('modalBorneDetails') modalDetails!: BorneDetailComponent;
  private map!: L.Map;
  bornes: any[] = [];
  rangeValue: number = 100;
  private currentSearchCircle: L.Circle | null = null; // Nouvelle variable pour le cercle

  toBorneDto(borne: Borne): BorneDto {
    return {
      id: borne.id,
      nom: borne.nom,
      photo: borne.photo,
      puissance: borne.puissance,
      estDisponible: borne.estDisponible,
      instruction: borne.instruction,
      surPied: borne.surPied,
      prix: borne.prix,
      utilisateurId: borne.utilisateurId,
      lieuId: borne.lieuId,
      mediasId: [],
      reservationsId: [],
      lieux: borne.lieux ? {
        id: borne.lieux.id,
        adresse: borne.lieux.adresse,
        codePostal: borne.lieux.codePostal,
        ville: borne.lieux.ville,
        latitude: borne.lieux.latitude,
        longitude: borne.lieux.longitude
      } : null
    };
  }

  filters = {
    ville: '',
    dateDebut: '',
    heureDebut:'',
    dateFin: '',
    heureFin:'',
    range: 100
  };

  private markers: L.Marker[] = [];
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  constructor(private geocodingService: GeocodingService ,private borneService: BorneService, private reservationService: ReservationService, private lieuxService: LieuxService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadAllBornes();
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
      zoom: 5});
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3});
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
        // Ajouter le marqueur à la carte
        const marker = L.marker([lat, lon]).addTo(this.map);

        // Écouter l'événement de clic directement sur le marqueur Leaflet
        marker.on('click', () => {
          // Appeler la méthode du composant pour ouvrir la modale
          this.viewDetails(this.toBorneDto(borne), this.filters);
        });

        this.markers.push(marker);
      } else {
        console.warn(`Borne ${borne.nom} n'a pas de coordonnées valides.`);
      }
    });
  }


  searchBornes() {
    //1. Formatage des dates et heures
    const dateDebutFormatted = this.filters.dateDebut && this.filters.heureDebut
      ? `${this.filters.dateDebut}T${this.filters.heureDebut}:00`
      : null;

    const dateFinFormatted = this.filters.dateFin && this.filters.heureFin
      ? `${this.filters.dateFin}T${this.filters.heureFin}:00`
      : null;

    let bornesToDisplay: any[] = [];

   // 2. Cas n°1 : Recherche par ville + rayon
    if (this.filters.ville?.trim()) {
      // A. Appel au service de géocodage
      this.geocodingService.getCoordinatesFromBackend(this.filters.ville).subscribe(
        (data: any) => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            // Modification du cercle
            if (this.currentSearchCircle) {
              this.map.removeLayer(this.currentSearchCircle);
            }

            // B. Affichage d’un cercle sur la carte
            this.currentSearchCircle = L.circle([lat, lon], {
              radius: this.filters.range * 1000,
              color: '#3498db',
              fillColor: '#3498db',
              fillOpacity: 0.1,
              weight: 1
            }).addTo(this.map);
            this.map.fitBounds(this.currentSearchCircle.getBounds());

            //C. Appel au backend pour récupérer les bornes
            const filtersComplets = {
              ville: this.filters.ville,
              latitude: lat,
              longitude: lon,
              rayon: this.filters.range,
              dateDebut: dateDebutFormatted,
              dateFin: dateFinFormatted,
            };
            this.borneService.searchBornes(filtersComplets).subscribe({
              next: (bornes) => {
                this.bornes = bornes;
                this.updateMap(bornes);
              },
              error: (err) => {
                console.error('Error during combined search', err);
              }
            });
          }
        },
        (err: any) => {
          console.error('Error retrieving coordinates from backend proxy', err);
        }
      );
    } else {
      //3. Cas n°2 : Recherche uniquement par dates
      const filtersComplets = {
        ville: null,
        rayon: null,
        dateDebut: dateDebutFormatted,
        dateFin: dateFinFormatted,
      };
      this.borneService.searchBornes(filtersComplets).subscribe({
        next: (bornes) => {
          this.bornes = bornes;
          this.updateMap(bornes);
        },
        error: (err) => {
          console.error('Error during date-only search', err);
        }
      });
    }
  }


  viewDetails(borne: BorneDto, filters: any) {
    if (this.modalDetails) {
      this.modalDetails.open(borne, filters);
    } else {
      console.error('La modal BorneDetailComponent n\'est pas disponible.');
    }
  }

  onRangeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.rangeValue = +input.value;
  }


  private loadAllBornes(): void {
    this.borneService.list().subscribe({
      next: (bornes) => {
        this.bornes = bornes;
        this.updateMap(bornes);},
      error: (err) => {
        console.error('' +
          'Erreur lors du chargement des bornes', err);
      }
    });
  }


  resetFilters(): void {
    // Réinitialisation de l'objet de filtres
    this.filters = {
      ville: '',
      dateDebut: '',
      heureDebut: '',
      dateFin: '',
      heureFin: '',
      range: 100 // Valeur par défaut
    };

    // Supprimer le cercle de recherche s'il existe
    if (this.currentSearchCircle) {
      this.map.removeLayer(this.currentSearchCircle);
      this.currentSearchCircle = null;
    }

    // Effacer les marqueurs de la carte
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
    this.bornes = [];

    // Ramener la carte à sa vue par défaut (centrage et zoom initial)
    this.map.setView([45.7305952, 4.836028], 5);

    // Recharger toutes les bornes pour que la carte ne soit pas vide
    this.loadAllBornes();
  }
}
