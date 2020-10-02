import { Injectable } from '@angular/core';
import { NULL_INJECTOR } from '@angular/core/src/render3/component';
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
  public currentVNumber = null;
  public foundConcept = null;
  BOK_PERMALINK_PREFIX = 'https://bok.eo4geo.eu/';

  constructor(private db: AngularFireDatabase) {
    db.list('current/concepts').valueChanges().subscribe(res => {
      this.concepts = this.parseConcepts(res);
    });
    db.list('current/relations').valueChanges().subscribe(res => {
      this.relations = res;
    });
/*     db.list('current/relations/version').valueChanges().subscribe(res => {
      this.currentVNumber = res;
    }); */
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

/*   searchPreviousConceptsDB(code) {
    if (this.currentVNumber) {
      const vn = this.currentVNumber - 1;

      while (vn > 0 && this.foundConcept === null) {

        this.db.list('v' + vn + '/concepts').valueChanges().subscribe(res => {
          res.forEach(concept => {
            if (concept.code === code) {
              this.foundConcept = {
                code: concept.code,
                name: concept.name,
                description: concept.description,
                permalink: this.BOK_PERMALINK_PREFIX + concept.code
              };
            }
          });

        });
      }
    }
  } */

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

  getConcepts() {
    return this.concepts;
  }
  getRelations() {
    return this.relations;
  }
  getRelationsPrent(res, concepts) {
    const relations = [];
    concepts.forEach(con => {
      const c = {
        code: con.code,
        name: con.name,
        description: con.description,
        children: [],
        parent: []
      };
      relations.push(c);
    });
    res.forEach(rel => {
      if (rel.name === 'is subconcept of') {
        relations[rel.target].children.push(relations[rel.source]);
        relations[rel.source].parent = relations[rel.target];
      }
    });
    return relations;
  }
}

