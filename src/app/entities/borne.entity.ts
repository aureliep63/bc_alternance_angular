//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe

import {User, UserHttp} from "./user.entity";
import {Media, MediaHttp} from "./media.entity";
import {Reservation, ReservationHttp} from "./reservation.entity";

export interface BorneHttp{
  id: number
  nom: string
  puissance: number
  estDisponible: boolean
  instruction: string
  surPied: boolean
  latitude: number
  longitude: number
  prix: number
  medias: MediaHttp[]
  reservations: ReservationHttp[]
  user: UserHttp


}

export interface Borne{
  id: number
  nom: string
  puissance: number
  estDisponible: boolean
  instruction: string
  surPied: boolean
  latitude: number
  longitude: number
  prix: number
  medias: Media[]
  reservations: Reservation[]
  user: User
}

export namespace Borne {
  export function fromHttp(http: BorneHttp): Borne {
    return {
      id: http.id,
      nom: http.nom,
      puissance: http.puissance,
      estDisponible: http.estDisponible,
      instruction: http.instruction,
      surPied: http.surPied,
      latitude: http.latitude,
      longitude: http.longitude,
      prix: http.prix,
      medias:http.medias ? http.medias.map(media => Media.fromHttp(media)) : [],
      reservations:http.reservations ? http.reservations.map(reservation => Reservation.fromHttp(reservation)): [],
      user: User.fromHttp(http.user),
    };
  }
}
