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
  public concepts: any[];
  public relations: any[];
  public allRelation: Observable<any>;
  public allConcepts: Observable<any>;
  BOK_PERMALINK_PREFIX = 'https://bok.eo4geo.eu/';

  constructor(db: AngularFireDatabase) {
    db.list('current/concepts').valueChanges().subscribe(res => {
      this.concepts = this.parseConcepts(res);
    });
    db.list('current/relations').valueChanges().subscribe(res => {
      this.getRelations(res);
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

  getRelations(res ) {
    const relations = [];
    this.concepts.forEach( con => {
      const c = {
        code: con.code,
        name: con.name,
        description: con.description,
        children: [],
        parent: []
      };
      relations.push(c);
    });
    res.forEach( rel => {
     if ( rel.name === 'is subconcept of') {
        relations[rel.target].children.push( relations[rel.source]);
        relations[rel.source].parent = relations[rel.target];
      }
    });
    this.relations = relations;
    return this.relations;
  }

}

