//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe

import {Borne, BorneHttp} from "./borne.entity";

export interface LieuxHttp{
  id: number
  adresse: string
  codePostal: string
  ville: string
  bornes: BorneHttp[]
}

export interface Lieux{
  id: number
  adresse: string
  codePostal: string
  ville: string
  bornes: Borne[]
}

export namespace Lieux{
  export function fromHttp(http: LieuxHttp):Lieux{
    return{
      id: http.id,
      adresse: http.adresse,
      codePostal: http.codePostal,
      ville: http.ville,
      bornes:http.bornes ? http.bornes.map(borne => Borne.fromHttp(borne)) :[],

    }
  }
}
