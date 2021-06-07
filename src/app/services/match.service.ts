import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Match } from '../model/resources.model';
import * as firebase from 'firebase';

const collection = 'Matches';

@Injectable({
  providedIn: 'root'
})

export class MatchService {
  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToMatches(): Observable<Match[]> {
    return this.db.collection<Match>(collection).valueChanges();
  }

  getMatchById(matchId: string): Observable<Match> {
    return this.db
      .collection(collection)
      .doc<Match>(matchId)
      .valueChanges();
  }

  addNewMatch(newMatch: Match) {
    const id = this.db.createId();
    newMatch._id = id;
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    newMatch.updatedAt = timestamp;
    newMatch.createdAt = timestamp;
    this.db
      .collection(collection)
      .doc(id)
      .set(Object.assign({}, newMatch));
  }

  removeMatch(matchId: string) {
    this.db
      .collection(collection)
      .doc(matchId)
      .delete();
  }

  updateMatch(matchId: string, updatedMatch: Match) {
    this.db
      .collection(collection)
      .doc<Match>(matchId)
      .update(updatedMatch);
  }

}
