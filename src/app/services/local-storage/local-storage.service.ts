import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  setItem(key: string, value: string): void {
    console.log(` Enregistrement dans localStorage: ${key} = ${value}`);
    localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    const value = localStorage.getItem(key);
    console.log(` Récupération depuis localStorage: ${key} = ${value}`);
    return value;
  }

  removeItem(key: string): void {
    console.log(` Suppression de ${key} dans localStorage`);
    localStorage.removeItem(key);
  }
}
