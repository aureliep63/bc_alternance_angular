//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe

import {Borne, BorneHttp} from "./borne.entity";
import {Reservation, ReservationHttp} from "./reservation.entity";

export interface UserHttp{
  id: number
  nom: string
  prenom: string
  email: string
  motDePasse: string
  role: string[]
  telephone: string
  dateDeNaissance: string
  nomRue: string
  codePostal: string
  ville: string
  bornes: BorneHttp[]
  reservations: ReservationHttp[]

}

export interface User{
  id: number
  nom: string
  prenom: string
  email: string
  motDePasse: string
  role: string[]
  telephone: string
  dateDeNaissance: Date
  nomRue: string
  codePostal: string
  ville: string
  bornes: Borne[]
  reservations: Reservation[] // apres entity Reservation
}

export namespace User{
  export function fromHttp(http: UserHttp):User{
    return{

      id: http.id,
      nom: http.nom,
      prenom: http.prenom,
      email: http.email,
      motDePasse: http.motDePasse,
      role: http.role,
      telephone: http.telephone,
      dateDeNaissance: new Date(http.dateDeNaissance),
      nomRue: http.nomRue,
      codePostal: http.codePostal,
      ville: http.ville,
      bornes: http.bornes ? http.bornes.map(borne => Borne.fromHttp(borne)) : [],
      reservations: http.reservations ? http.reservations.map(reservation => Reservation.fromHttp(reservation)) : [],
    }
  }
}
