import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private url = environment.API_URL;
  constructor(private http: HttpClient) { }

  getCoordinates(ville: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.nominatimUrl}`, {
      params: {
        q: ville,
        format: 'json',
        limit: '1'
      }
    });
  }

  // New method to call your backend proxy
  getCoordinatesFromBackend(city: string): Observable<any> {
    return this.http.get<any>(`${this.url}/api/geocode?q=${city}`);
  }
}
