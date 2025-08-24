//on utilise pas de classe pour les entités car plus lourd et moins maintenable, quand ol s'agit de petit objet
// si on récupère un object métier tres lourd alors il vaut mieux utiliser une classe au lieu d'une interface
// pour http toujours une interface, si on map ca peut être intéréssant d'avoir une classe

import {Borne, BorneHttp} from "./borne.entity";

export interface LieuxHttp{
  id?: number
  adresse: string
  codePostal: string
  ville: string
  latitude?: number;
  longitude?: number;
}

export interface Lieux{
  id?: number | null;
  adresse: string;
  codePostal: string;
  ville: string;
  bornesId?: number[];
  latitude?: number | null;
  longitude?: number | null;
}

export namespace Lieux{
  export function fromHttp(http: LieuxHttp):{
    id: number | undefined;
    adresse: string;
    codePostal: string;
    ville: string;
    latitude: number | undefined;
    longitude: number | undefined
  }{
    return{
      id: http.id,
      adresse: http.adresse,
      codePostal: http.codePostal,
      ville: http.ville,
      latitude: http.latitude,
      longitude: http.longitude
    }
  }
}
