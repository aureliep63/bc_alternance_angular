import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment.development";
import {Lieux, LieuxHttp} from "../../entities/lieux.entity";
import {lastValueFrom, map, Observable} from "rxjs";
import {Media, MediaHttp} from "../../entities/media.entity";

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private url:string;

  constructor(private http:HttpClient) {
    this.url = environment.API_URL + environment.API_RESOURCES.MEDIAS
  }

  list(): Observable<Media[]>{
    return this.http
      .get<MediaHttp[]>(this.url)
      .pipe(
        map(mediasHttp => mediasHttp.map(m => Media.fromHttp(m)))
      )
  }

  getById(id:number): Observable<Media> {
    return this.http
      .get<MediaHttp>(`${this.url}/${id}`)
      .pipe(
        map(mediaHttp => Media.fromHttp(mediaHttp))
      )
  }
  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('http://localhost:8080/api/files/upload', formData, {
      responseType: 'text'
    });
  }

}


