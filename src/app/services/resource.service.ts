import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Resource, TrainingMaterial} from '../model/resources.model';
import {HttpClient} from '@angular/common/http';
import * as firebase from 'firebase';
import {BokService} from './bok.service';

const collectionJO = 'JobOffers';
const collectionOP = 'OcuProfiles';
const collectionSP = 'StudyPrograms';
const collectionJODisplay = 'Job Offer';
const collectionOPDisplay = 'Occupational Profile';
const collectionSPDisplay = 'Educational Offer';
const collectionOT = 'Other';
const urlJOT = 'https://ucgis-tools-jot.web.app/#/detail/';
const urlCDT = 'https://ucgis-tools-cdt.web.app/detail/';
const urlOPT = 'https://ucgis-tools-opt.web.app/#/detail/';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private db: AngularFirestore;

  public allResources = [];
  public publicResources = [];
  public tmUpdated = true;
  public traininMaterial = [];
  constructor(db: AngularFirestore,  public bokService: BokService, private http: HttpClient) {
    this.db = db;
    this.getResources();
  }

  getResources() {
    this.allResources = [];
    this.publicResources = [];

    // get Job Offers
    const joSubs = this.db
      .collection<Resource>(collectionJO)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionJO;
          r.collectionDisplay = collectionJODisplay;
          r.concepts = r.occuProf.knowledge;
          r.skills = r.occuProf.skills;
          // r.fields = r.occuProf.fields;
          r.name = r.occuProf.title;
          r.eqf = r.occuProf.eqf;
          r.url = urlJOT + r._id;
          r.division = r.division ? r.division : '';
          r.type = 2;
          r.description = r.occuProf.description.slice(0, 100) + '[...]'; // truncate description
          this.allResources.push(r);
          if (r.isPublic) {
            this.publicResources.push(r);
          }
        });
        joSubs.unsubscribe();
        this.sortedByName();
      });

    // get Study Programs
    const spSubs = this.db
      .collection<Resource>(collectionSP)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionSP;
          r.collectionDisplay = collectionSPDisplay;
          r.url = urlCDT + r._id;
          r.division = r.division ? r.division : '';
          r.type = 0;
          r.isPublic = r.levelPublic;
          r.description = r.description.slice(0, 100) + '[...]'; // truncate description
          if ( r.concepts && r.concepts.length > 0 ) {
            const cptTemp = [];
            r.concepts.forEach( cpt => {
              if (cptTemp.indexOf(cpt) === -1) {
                cptTemp.push(cpt);
              }
            });
            r.concepts = cptTemp;
          }
          r.concepts = r.concepts && r.concepts.length > 0 ? r.concepts : [];
          if (r.children && r.children.length > 0) { // modules
            r.children.forEach(childM => {
              childM.concepts.forEach(c => {
                if (r.concepts.indexOf(c) === -1) {
                  r.concepts.push(c);
                }
              });
              if (childM.children && childM.children.length > 0) { // courses
                childM.children.forEach(childC => {
                  childC.concepts.forEach(c => {
                    if (r.concepts.indexOf(c) === -1) {
                      r.concepts.push(c);
                    }
                  });
                  if (childC.children && childC.children.length > 0) { // lectures
                    childC.children.forEach(childL => {
                      childL.concepts.forEach(c => {
                        if (r.concepts.indexOf(c) === -1) {
                          r.concepts.push(c);
                        }
                      });
                    });
                  }
                });
              }
            });
          }
          this.allResources.push(r);
          if (r.isPublic) {
            this.publicResources.push(r);
          }
        });
        spSubs.unsubscribe();
        this.sortedByName();
      });

    // get Occupational Profiles
    const opSubs = this.db
      .collection<Resource>(collectionOP)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionOP;
          r.collectionDisplay = collectionOPDisplay;
          r.concepts = r.knowledge;
          r.name = r.title;
          r.url = urlOPT + r._id;
          r.division = r.division ? r.division : '';
          r.type = 1;
          r.description = r.description.slice(0, 100) + '[...]'; // truncate description
          this.allResources.push(r);
          if (r.isPublic) {
            this.publicResources.push(r);
          }
        });
        opSubs.unsubscribe();
        this.sortedByName();
      });

    // get Other
    const otSubs = this.db
      .collection<Resource>(collectionOT)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionOT;
          r.collectionDisplay = collectionOT;
          r.concepts = r.concepts;
          r.name = r.title;
          r.url = r.url;
          r.division = r.division ? r.division : '';
          r.type = 3;
          r.description = r.description ?  r.description.slice(0, 100) + '[...]' : ''; // truncate description
          this.allResources.push(r);
          if (r.isPublic) {
            this.publicResources.push(r);
          }
        });
        otSubs.unsubscribe();
        this.sortedByName();
      });
  }

  sortedByName () {
    this.publicResources.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ?  1 : -1);
  }
}
