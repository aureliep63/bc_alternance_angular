import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment.development";
import {Borne, BorneHttp} from "../../entities/borne.entity";
import {lastValueFrom, map} from "rxjs";
import {Lieux, LieuxHttp} from "../../entities/lieux.entity";

@Injectable({
  providedIn: 'root'
})
export class LieuxService {

  private url:string;

  constructor(private http:HttpClient) {
    this.url = environment.API_URL + environment.API_RESOURCES.LIEUX
  }

  list(): Promise<Lieux[]>{
    const obs = this.http
      .get<LieuxHttp[]>(this.url)
      .pipe(
        map(lieuxHttp => lieuxHttp.map(l => Lieux.fromHttp(l)))
      )
    return lastValueFrom(obs)
  }

  getById(id:number): Promise<Lieux> {
    const obs = this.http
      .get<LieuxHttp>(`${this.url}/${id}`)
      .pipe(
        map(lieuxHttp => Lieux.fromHttp(lieuxHttp))
      )
    return lastValueFrom(obs)
  }
}
