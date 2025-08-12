import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Borne, BorneHttp} from "../../entities/borne.entity";
import {lastValueFrom, map, Observable} from "rxjs";
import {Lieux, LieuxHttp} from "../../entities/lieux.entity";

@Injectable({
  providedIn: 'root'
})
export class LieuxService {

  private url:string;

  constructor(private http:HttpClient) {
    this.url = environment.API_URL + environment.API_RESOURCES.LIEUX
  }

  list(): Observable<{
    id: number | undefined;
    adresse: string;
    codePostal: string;
    ville: string;
    latitude: number | undefined;
    longitude: number | undefined
  }[]> {
    return this.http
      .get<LieuxHttp[]>(this.url)
      .pipe(map(lieuxHttp => lieuxHttp.map(l => Lieux.fromHttp(l))));
  }


  getById(id:number): Observable<LieuxHttp> {
    return this.http
      .get<LieuxHttp>(`${this.url}/${id}`)
      .pipe(
        map(lieuxHttp => Lieux.fromHttp(lieuxHttp))
      )
  }

  create(lieu: LieuxHttp): Observable<LieuxHttp> {
    return this.http.post<LieuxHttp>(this.url, lieu);
  }
}
