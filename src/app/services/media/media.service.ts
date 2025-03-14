import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment.development";
import {Lieux, LieuxHttp} from "../../entities/lieux.entity";
import {lastValueFrom, map} from "rxjs";
import {Media, MediaHttp} from "../../entities/media.entity";

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private url:string;

  constructor(private http:HttpClient) {
    this.url = environment.API_URL + environment.API_RESOURCES.MEDIAS
  }

  list(): Promise<Media[]>{
    const obs = this.http
      .get<MediaHttp[]>(this.url)
      .pipe(
        map(mediasHttp => mediasHttp.map(m => Media.fromHttp(m)))
      )
    return lastValueFrom(obs)
  }

  getById(id:number): Promise<Media> {
    const obs = this.http
      .get<MediaHttp>(`${this.url}/${id}`)
      .pipe(
        map(mediaHttp => Media.fromHttp(mediaHttp))
      )
    return lastValueFrom(obs)
  }
}


