//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe


import {Media, MediaHttp} from "./media.entity";
import {Reservation, ReservationHttp} from "./reservation.entity";
import {Lieux, LieuxHttp} from "./lieux.entity";

export interface BorneDtoHttp{
  id: number
  nom: string
  photo: string
  puissance: number
  estDisponible: boolean
  instruction: string
  surPied: boolean
  prix: number
  mediasId: number[]
  reservationsId: number[]
  utilisateurId: number
  lieuId: number;
  lieux?: Lieux | null;
}

export interface BorneDto{
  id: number
  nom: string
  photo: string
  puissance: number
  estDisponible: boolean
  instruction: string
  surPied: boolean
  prix: number
  mediasId: number[]
  reservationsId: number[]
  utilisateurId: number
  lieuId: number;
  lieux?: Lieux | null; // ✅ ajout pour afficher ville dans le HTML
}

export namespace BorneDto {
  export function fromHttp(http: BorneDtoHttp): BorneDto {
    return {
      id: http.id,
      nom: http.nom,
      photo:http.photo,
      puissance: http.puissance,
      estDisponible: http.estDisponible,
      instruction: http.instruction,
      surPied: http.surPied,
      prix: http.prix,
      mediasId:http.mediasId,
      reservationsId:http.reservationsId ,
      utilisateurId: http.utilisateurId,
      lieuId: http.lieuId,
      lieux: http.lieux ? {                     // ✅ ajout
        id: http.lieux.id!,
        adresse: http.lieux.adresse,
        codePostal: http.lieux.codePostal,
        ville: http.lieux.ville,
        latitude: http.lieux.latitude,
        longitude: http.lieux.longitude
      } : null

    };
  }
}
