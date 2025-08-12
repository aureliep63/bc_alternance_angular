import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Media, MediaHttp} from "../../entities/media.entity";
import {lastValueFrom, map, Observable} from "rxjs";
import {Reservation, ReservationHttp} from "../../entities/reservation.entity";
import {Borne} from "../../entities/borne.entity";

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private url:string;

  constructor(private http:HttpClient) {
    this.url = environment.API_URL + environment.API_RESOURCES.RESERVATIONS
  }

  list(): Observable<Reservation[]>{
    return  this.http
      .get<ReservationHttp[]>(this.url)
      .pipe(
        map(reservationsHttp => reservationsHttp.map(r => Reservation.fromHttp(r)))
      )
  }

  getById(id:number): Observable<Reservation> {
    return this.http
      .get<ReservationHttp>(`${this.url}/${id}`)
      .pipe(
        map(reservationHttp => Reservation.fromHttp(reservationHttp))
      )
  }

  getByUserId(idUser: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.url}/user/${idUser}/reservations`);
  }

  getByBorneId(idBorne: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.url}/borne/${idBorne}/reservations`);
  }

  updateStatus(id: number, status: string): Observable<Object> {
    return this.http.patch(`${this.url}/${id}/status`, { status });
  }

}
