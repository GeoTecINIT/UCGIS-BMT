import { Injectable } from '@angular/core';
import { NULL_INJECTOR } from '@angular/core/src/render3/component';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface BoKConcept {
  permalink?: String;
  description?: String;
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
  public allConceptsCodes = [];

  BOK_PERMALINK_PREFIX = 'https://gistbok-topics.ucgis.org/';
  private URL_BASE = 'https://ucgis-bok-dev-default-rtdb.firebaseio.com/';


  constructor(private db: AngularFireDatabase, private http: HttpClient) {

     // only need to retrieve full bok once
    this.http.get(this.URL_BASE + '.json')
      .subscribe(data => {
        this.concepts = this.parseConcepts(data['current']['concepts']);
        this.relations = data['current']['relations'];
        this.currentVNumber = data['current']['version'];
        this.searchPreviousConceptsDB(data);
      });


    /*  db.list('current/concepts').valueChanges().subscribe(res => {
          this.concepts = this.parseConcepts(res);
        });
        db.list('current/relations').valueChanges().subscribe(res => {
          this.relations = res;
        });
        db.object('current/version').valueChanges().subscribe(action => {
          this.currentVNumber = action;
          this.searchPreviousConceptsDB();
        }); */
  }

  parseConcepts(dbRes) {
    const concepts = [];
    if (dbRes && dbRes.length > 0) {
      dbRes.forEach(concept => {
        const c = {
          code: concept.code,
          name: concept.name,
          description: concept.description,
          permalink: this.BOK_PERMALINK_PREFIX + concept.code
        };
        this.allConceptsCodes.push(concept.code);
        concepts.push(c);
      });
    }
    return concepts;
  }

  searchPreviousConceptsDB(data) {
    if (this.currentVNumber) {
      let vn = this.currentVNumber - 1;
      while (vn > 0 && this.foundConcept === null) {
        const res = data['v' + vn]['concepts']; // only need to retrieve full bok once
        // this.db.list('v' + vn + '/concepts').valueChanges().subscribe(res => {
        res.forEach((concept: BoKConcept) => {
          if (this.allConceptsCodes.indexOf(concept.code) === -1) { // old concept not present in current
            const c = {
              code: concept.code,
              name: concept.name,
              description: concept.description,
              permalink: this.BOK_PERMALINK_PREFIX + concept.code
            };
            this.allConceptsCodes.push(concept.code);
            this.concepts.push(c);
          }
        });
        //  });
        vn = vn - 1;
      }
    }
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
        permalink: this.BOK_PERMALINK_PREFIX + code
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
    const relations = concepts;
    res.forEach(rel => {
      if (rel.name === 'is subconcept of') {
        if ( relations[rel.target]['children']) {
          relations[rel.target].children.push(relations[rel.source]);
        } else {
          relations[rel.target]['children'] = [];
        }
        relations[rel.source]['parent'] = relations[rel.target];
      }
    });
    return relations;
  }
}

