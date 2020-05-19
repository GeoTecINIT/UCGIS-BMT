import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Other } from '../model/resources.model';

const collection = 'Other';

@Injectable({
  providedIn: 'root'
})

export class OtherService {
  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToOther(): Observable<Other[]> {
    return this.db.collection<Other>(collection).valueChanges();
  }
  addNewOther(newMatch: Other) {
    const id = this.db.createId();
    newMatch._id = id;
    this.db
      .collection(collection)
      .doc(id)
      .set(newMatch);
  }
}
