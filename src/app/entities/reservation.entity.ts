//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe

import {Borne, BorneHttp} from "./borne.entity";
import {User, UserHttp} from "./user.entity";

export interface ReservationHttp{
  id: number
  dateDebut: string
  dateFin: string
  heureDebut: string
  heureFin: string
  status: 'ACCEPTER' | 'EN_ATTENTE'| 'REFUSER'| 'ANNULER'
  user: UserHttp
  borne: BorneHttp
}

export interface Reservation{
  id: number
  dateDebut: Date
  dateFin: Date
  heureDebut: string
  heureFin: string
  status: 'ACCEPTER' | 'EN_ATTENTE'| 'REFUSER'| 'ANNULER'
  user: User
  borne: Borne
}

export namespace Reservation{
  export function fromHttp(http: ReservationHttp):Reservation{
    return{
      id: http.id,
      dateDebut:new Date(http.dateDebut),
      dateFin:new Date( http.dateFin),
      heureDebut:http.heureDebut,
      heureFin:http.heureFin,
      status:http.status,
      user: User.fromHttp(http.user),
      borne: Borne.fromHttp(http.borne),
    }
  }
}

