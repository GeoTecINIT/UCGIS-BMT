import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const collection = 'Fields';

export interface Field { name: string; code: Number; parent: string; grandparent: string; greatgrandparent: string; }

@Injectable({
  providedIn: 'root'
})
export class FieldsService {
  public allfields: any;
  public result: any;
  constructor(
    private http: HttpClient) {

    // TODO: Move fields.json to firebase storage - gives a CORS error
    // const ref = this.storage.ref('fields.json');
    //  ref.getDownloadURL().subscribe(function(url) {

    this.http.get('assets/json/fields.json').subscribe((data) => {
      this.allfields = data;
    /* // sort by two or more keys
      this.allfields.sort((a, b) => {
        return this.cmp(
          [this.cmp(a.grandparent, b.grandparent), this.cmp(a.name, b.name)],
          [this.cmp(b.grandparent, a.grandparent), this.cmp(b.name, a.name)]
        );
      });
      console.log(JSON.stringify(this.allfields));
      */
    });
  }

  // generic comparison function
  cmp(x, y) {
    return x > y ? 1 : x < y ? -1 : 0;
  }


}

