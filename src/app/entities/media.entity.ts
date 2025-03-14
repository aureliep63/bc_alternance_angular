//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe

import {Borne, BorneHttp} from "./borne.entity";

export interface MediaHttp{
  id: number
  libelle: string
  typeMedia: 'PHOTO' | 'VIDEO'
  borne: BorneHttp
}

export interface Media{
  id: number
  libelle: string
  typeMedia: 'PHOTO' | 'VIDEO'
  borne: Borne
}

export namespace Media{
  export function fromHttp(http: MediaHttp):Media{
    return{
      id: http.id,
      libelle: http.libelle,
      typeMedia: http.typeMedia,
      borne:Borne.fromHttp(http.borne)
    }
  }
}
