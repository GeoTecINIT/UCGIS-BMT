import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Resource } from '../model/resources.model';

const collectionJO = 'JobOffers';
const collectionOP = 'OcuProfiles';
const collectionSP = 'StudyPrograms';
const collectionJODisplay = 'Job Offer';
const collectionOPDisplay = 'Occupational Profile';
const collectionSPDisplay = 'Learning Content';
const collectionOT = 'Other';
const urlJOT = 'https://eo4geo-jot.web.app/#/detail/';
const urlCDT = 'https://eo4geo-cdt.web.app/detail/';
const urlOPT = 'https://eo4geo-opt.web.app/#/detail/';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private db: AngularFirestore;

  public allResources = [];

  constructor(db: AngularFirestore) {
    this.db = db;
    this.getResources();
  }

  getResources() {
    // get Job Offers
    const joSubs = this.db
      .collection<Resource>(collectionJO)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionJO;
          r.collectionDisplay = collectionJODisplay;
          r.concepts = r.occuProf.knowledge;
          r.skills = r.occuProf.skills;
          //r.fields = r.occuProf.fields;
          r.name = r.occuProf.title;
          r.url = urlJOT + r._id;
          r.type = 2;
          r.description = r.occuProf.description.slice(0, 100) + '[...]'; // truncate description
          this.allResources.push(r);
        });
        joSubs.unsubscribe();
      });

    // get Study Programs
    const spSubs = this.db
      .collection<Resource>(collectionSP)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionSP;
          r.collectionDisplay = collectionSPDisplay;
          r.url = urlCDT + r._id;
          r.type = 0;
          r.description = r.description.slice(0, 100) + '[...]'; // truncate description
          r.concepts = r.concepts && r.concepts.length > 0 ? r.concepts : [];
          if (r.children && r.children.length > 0) { // modules
            r.children.forEach(childM => {
              childM.concepts.forEach(c => {
                r.concepts.push(c);
              });
              if (childM.children && childM.children.length > 0) { // courses
                childM.children.forEach(childC => {
                  childC.concepts.forEach(c => {
                    r.concepts.push(c);
                  });
                  if (childC.children && childC.children.length > 0) { // lectures
                    childC.children.forEach(childL => {
                      childL.concepts.forEach(c => {
                        r.concepts.push(c);
                      });
                    });
                  }
                });
              }
            });
          }
          this.allResources.push(r);
        });
        spSubs.unsubscribe();
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
          r.type = 1;
          r.description = r.description.slice(0, 100) + '[...]'; // truncate description
          this.allResources.push(r);
        });
        opSubs.unsubscribe();
      });

    // get Other
    const otSubs = this.db
      .collection<Resource>(collectionOT)
      .valueChanges().subscribe(rs => {
        rs.forEach(r => {
          r.collection = collectionOT;
          r.collectionDisplay = collectionOT;
          r.concepts = r.knowledge;
          r.name = r.title;
          r.url = r.url;
          r.type = 3;
          r.description = r.description.slice(0, 100) + '[...]'; // truncate description
          this.allResources.push(r);
        });
        otSubs.unsubscribe();
      });
  }
}
