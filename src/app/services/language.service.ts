import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Language { code: string; name: string; }

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public allLanguages: any;

  constructor(
    private http: HttpClient) {

    // TODO: Move fields.json to firebase storage - gives a CORS error
    // const ref = this.storage.ref('fields.json');
    //  ref.getDownloadURL().subscribe(function(url) {

    this.http.get('assets/json/languages.json').subscribe((data) => {
      this.allLanguages = data;
    });
  }

  // generic comparison function
  cmp(x, y) {
    return x > y ? 1 : x < y ? -1 : 0;
  }

}
