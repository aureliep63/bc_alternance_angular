//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe


import {Media, MediaHttp} from "./media.entity";
import {Reservation, ReservationHttp} from "./reservation.entity";
import {Lieux, LieuxHttp} from "./lieux.entity";

export interface BorneHttp{
  id: number
  nom: string
  photo: string
  puissance: number
  estDisponible: boolean
  instruction: string
  surPied: boolean
  latitude: number
  longitude: number
  prix: number
  medias: MediaHttp[]
  reservations: ReservationHttp[]
  utilisateurId: number
  lieuId: number;
  lieux: LieuxHttp;
}

export interface Borne{
  id: number
  nom: string
  photo: string
  puissance: number
  estDisponible: boolean
  instruction: string
  surPied: boolean
  latitude: number
  longitude: number
  prix: number
  medias: Media[]
  reservations: Reservation[]
  utilisateurId: number
  lieuId: number;
  lieux: Lieux | null;
}

export namespace Borne {
  export function fromHttp(http: BorneHttp): Borne {
    return {
      id: http.id,
      nom: http.nom,
      photo:http.photo,
      puissance: http.puissance,
      estDisponible: http.estDisponible,
      instruction: http.instruction,
      surPied: http.surPied,
      latitude: http.latitude,
      longitude: http.longitude,
      prix: http.prix,
      medias:http.medias ? http.medias.map(media => Media.fromHttp(media)) : [],
      reservations:http.reservations ? http.reservations.map(reservation => Reservation.fromHttp(reservation)): [],
      utilisateurId: http.utilisateurId,
      lieuId: http.lieuId,
      lieux: Lieux.fromHttp(http.lieux),
    };
  }
}
