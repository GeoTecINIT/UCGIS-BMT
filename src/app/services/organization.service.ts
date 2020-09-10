import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from './user.service';

const collection = 'Organizations';

export class Organization extends Object {

  public _id: string;
  public name: string;
  public description: string;
  public admin: string[];
  public regular: string[];
  public pending: string[];
  public adminUser: User[];
  public regularUser: User[];
  public pendingUser: User[];
  public isPublic: boolean;
  public contact: string;
  public divisions: string[];

  constructor(public org: Organization = null) {
    super();
    if (org) {
      this._id = org._id != null ? org._id : null;
      this.name = org.name != null ? org.name : '';
      this.description = org.description != null ? org.description : '';
      this.admin = org.admin != null ? org.admin : [];
      this.regular = org.regular != null ? org.regular : [];
      this.pending = org.pending != null ? org.pending : [];
      this.adminUser = org.adminUser != null ? org.adminUser : [];
      this.regularUser = org.regularUser != null ? org.regularUser : [];
      this.pendingUser = org.pendingUser != null ? org.pendingUser : [];
      this.isPublic = org.isPublic != null ? org.isPublic : false;
      this.contact = org.contact != null ? org.contact : '';
      this.divisions = org.divisions != null ? org.divisions : [];
    } else {
      this._id = null;
      this.name = '';
      this.description = '';
      this.admin = [];
      this.regular = [];
      this.pending = [];
      this.adminUser = [];
      this.regularUser = [];
      this.pendingUser = [];
      this.isPublic = false;
      this.contact = '';
      this.divisions = [];
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  public currentOrganization = Organization;

  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToOrganizations(): Observable<Organization[]> {
    return this.db.collection<Organization>(collection).valueChanges();
  }

  getOrganizationById(organizationId: string): Observable<Organization> {
    return this.db
      .collection(collection)
      .doc<Organization>(organizationId)
      .valueChanges();

    // Collection group query
    /*  return this.db.collectionGroup('users', ref => ref.where('_id', '==', organizationId)).valueChanges(); */
  }

  updateOrganizationWithId(organizationId: string, updatedOrganization: Organization) {
    const orgToSave = { ...updatedOrganization }; // clone object or users dissappear
    orgToSave.adminUser = null;
    orgToSave.regularUser = null;
    orgToSave.pendingUser = null;
    this.db
      .collection(collection)
      .doc<Organization>(organizationId)
      .update(orgToSave);
  }

  removeOrganization(org: Organization) {
    this.db
      .collection(collection)
      .doc<Organization>(org._id).delete();
  }

  addNewOrganization(org: Organization): string {
    org.name = 'New Organization';
    const idOrg = this.db.createId();
    org._id = idOrg;
    this.db.collection<Organization>(collection).doc(idOrg).set(org);
    return idOrg;
  }

}
