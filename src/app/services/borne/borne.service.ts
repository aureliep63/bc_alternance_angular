import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Borne, BorneHttp} from "../../entities/borne.entity";
import {catchError, lastValueFrom, map, Observable, throwError} from "rxjs";
import {BorneDto} from "../../entities/borneDto.entity";

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
      .get<BorneHttp[]>(this.url) //envoi une requête HTTP GET à l’URL
      .pipe( //transforme le résultat avant de le renvoyer
        map(bornesHttp =>
          bornesHttp.map(b => Borne.fromHttp(b)))
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

  addBorne(formData: FormData): Observable<BorneDto> {
    return this.http.post<BorneDto>(this.url+"/user/bornes", formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          return throwError(() => new Error("Impossible de supprimer : la borne est réservée."));
        }
        return throwError(() => error);
      })
    );
  }

  updateBorne(id: number, formData: FormData): Observable<BorneDto> {
    return this.http.put<BorneDto>(`${this.url}/user/bornes/${id}`, formData);
  }

  searchBornes(filters: any): Observable<BorneDto[]> {
    return this.http.post<BorneDto[]>(`${this.url}/search`, filters);
  }


}
