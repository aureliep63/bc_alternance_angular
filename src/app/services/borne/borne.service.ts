import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment.development";
import {Borne, BorneHttp} from "../../entities/borne.entity";
import {lastValueFrom, map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BorneService {

  private url:string;

  constructor(private http:HttpClient) {
    this.url = environment.API_URL + environment.API_RESOURCES.BORNES
  }

  list(): Observable<Borne[]>{
    return this.http
      .get<BorneHttp[]>(this.url)
      .pipe(
        map(bornesHttp => bornesHttp.map(b => Borne.fromHttp(b)))
      )
  }

  getByUserId(idUser: number): Observable<Borne[]> {
    return this.http.get<Borne[]>(`${this.url}/user/${idUser}/bornes`);
  }

  getByReservationId(idResa: number): Observable<Borne[]> {
    return this.http.get<Borne[]>(`${this.url}/reservation/${idResa}/bornes`);
  }

  create(borne: Borne): Observable<Borne> {
    return this.http.post<Borne>(this.url, borne);
  }
  //create(formData: FormData): Observable<Borne> {
    //return this.http.post<Borne>(`${this.url}`, formData);
  //}


}
