import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

export interface BoKConcept {
  permalink?: String;
  descrption?: String;
  name?: String;
  code?: String;
}

@Injectable({
  providedIn: 'root'
})
export class BokService {
  concepts: any[];
  BOK_PERMALINK_PREFIX = 'https://bok.eo4geo.eu/';

  constructor(db: AngularFireDatabase) {
    db.list('current/concepts').valueChanges().subscribe(res => {
      this.concepts = this.parseConcepts(res);
    });
  }

  parseConcepts(dbRes) {
    let concepts = [];
    if (dbRes && dbRes.length > 0) {
      dbRes.forEach(concept => {
        const c = {
          code: concept.code,
          name: concept.name,
          description: concept.description,
          permalink: this.BOK_PERMALINK_PREFIX + concept.code
        };
        concepts.push(c);
      });
    }
    console.log(concepts);
    return concepts;
  }

  getConceptInfoByCode(code) {
    const arrayRes = this.concepts.filter(
      it =>
        it.code.toLowerCase() === code.toLowerCase()
    );
    if (arrayRes.length > 0) {
      return arrayRes[0];
    } else {
      return {
        code: '',
        name: '',
        description: '',
        permalink: this.BOK_PERMALINK_PREFIX
      };
    }
  }

}

