
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Match } from '../../model/resources.model';
import { MatchService } from '../../services/match.service';
import { Organization, OrganizationService } from '../../services/organization.service';
import { FieldsService, Field } from '../../services/fields.service';
import { EscoCompetenceService } from '../../services/esco-competence.service';
import { ResourceService } from '../../services/resource.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { User, UserService } from '../../services/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';


// import * as fs from 'fs';
// import * as parsePdf from 'parse-pdf';

// const fs = require('fs');
// const parsePdf = require('parse-pdf');

// import * as jspdf from 'parse-pdf';

import * as pdfjs from 'pdfjs-dist';

@Component({
  selector: 'app-newmatch',
  templateUrl: './newmatch.component.html',
  styleUrls: ['./newmatch.component.scss']
})
export class NewmatchComponent implements OnInit {

  model = new Match('', '', '', '', '', '', true, null, null);

  selectedMatch: Match;
  _id: string;
  mode: string;
  title: string;

  canMakePublicProfiles = false;
  userOrgs: Organization[] = [];
  saveOrg: Organization;
  currentUser: User;

  showResource1 = -1;
  searchText1 = '';
  advancedSearch1 = false;
  conceptsFilter1 = '';
  skillsFilter1 = '';
  file1 = null;

  showResource2 = -1;
  searchText2 = '';
  advancedSearch2 = false;
  conceptsFilter2 = '';
  skillsFilter2 = '';
  file2 = null;

  filteredResources1 = [];
  filteredResources2 = [];
  selectedResources = [];

  meta1 = null;
  meta2 = null;

  bokConcepts1 = [];
  bokConcepts2 = [];
  commonBokConcepts = [];

  uploadPercent1 = null;
  uploadPercent2 = null;

  @ViewChild('textBoK') textBoK: ElementRef;

  formGroup = this.fb.group({
    file: [null, Validators.required]
  });

  constructor(
    private matchService: MatchService,
    private organizationService: OrganizationService,
    private userService: UserService,
    public fieldsService: FieldsService,
    public escoService: EscoCompetenceService,
    public resourceService: ResourceService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    // private cd: ChangeDetectorRef,
    private storage: AngularFireStorage
  ) {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
          /*     if (this.currentUser.organizations && this.currentUser.organizations.length > 0) {
                this.currentUser.organizations.forEach(orgId => {
                  this.organizationService.getOrganizationById(orgId).subscribe(org => {
                    if (org) {
                      this.userOrgs.push(org);
                      this.saveOrg = this.userOrgs[0];
                      if (org.isPublic) { // if Any of the organizations the user belongs if public, can make public profiles
                        this.canMakePublicProfiles = true;
                      }
                    }
                  });
                });
              } */
        });
      }
    });
  }

  ngOnInit() {
    this.getMode();
  }

  saveMatch() {
    if (this.mode === 'copy') {
      this.matchService.updateMatch(this._id, this.model);
    } else {
      this.model.userId = this.afAuth.auth.currentUser.uid;
      //  this.model.orgId = this.saveOrg._id;
      //  this.model.orgName = this.saveOrg.name;
      //  this.model.isPublic = this.saveOrg.isPublic ? this.model.isPublic : false;
      this.model.isPublic = true;
      this.matchService.addNewMatch(this.model);
    }
  }

  getMode(): void {
    this.mode = this.route.snapshot.paramMap.get('mode');
    if (this.mode === 'duplicate' || this.mode === 'copy') {
      if (this.mode === 'copy') {
        this.title = 'Copy BoK Match';
      } else {
        this.title = 'Duplicate BoK Match';

      }
      this.getMatchId();
      this.fillForm();
    } else {
      this.title = 'Add New BoK Match';
    }
  }

  getMatchId(): void {
    this._id = this.route.snapshot.paramMap.get('name');
    this.matchService
      .getMatchById(this._id)
      .subscribe(m => (this.selectedMatch = m));
  }

  fillForm(): void {
    this.matchService
      .getMatchById(this._id)
      .subscribe(m => (this.model = m));
  }

  filter1() {
    this.filteredResources1 = this.resourceService.allResources;
    this.filteredResources1 = this.filteredResources1.filter(
      it =>
        it.name.toLowerCase().includes(this.searchText1) ||
        it.description.toLowerCase().includes(this.searchText1)
    );
  }

  filter2() {
    this.filteredResources2 = this.resourceService.allResources;
    this.filteredResources2 = this.filteredResources2.filter(
      it =>
        it.name.toLowerCase().includes(this.searchText2) ||
        it.description.toLowerCase().includes(this.searchText2)
    );
  }

  onFileChange1(event) {
    // empty filtered resources to hide EO4GEO content
    this.filteredResources1 = [];
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      [this.file1] = event.target.files;
      console.log('onFileChange2');
      console.log(this.file2);
      // upload file to firebase storage to be able to get metadata
      this.uploadFile1(this.file1);
      reader.readAsDataURL(this.file1);
      reader.onload = () => {
        this.formGroup.patchValue({
          file: reader.result
        });
      };
    }
  }

  onFileChange2(event) {
    // empty filtered resources to hide EO4GEO content
    this.filteredResources2 = [];
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      [this.file2] = event.target.files;
      console.log('onFileChange2');
      console.log(this.file2);
      // upload file to firebase storage to be able to get metadata
      this.uploadFile2(this.file2);
      reader.readAsDataURL(this.file2);
      reader.onload = () => {
        this.formGroup.patchValue({
          file: reader.result
        });
      };
    }
  }

  selectResource1(res) {
    this.bokConcepts1 = this.getBokConceptsFromResource(res);
    //  this.match();
  }

  selectResource2(res) {
    this.bokConcepts2 = this.getBokConceptsFromResource(res);
    //  this.match();
  }

  uploadFile1(file) {
    const filePath = 'other/custom-' + encodeURI(file.name);
    // upload file to firebase storage
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent1 = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        // take storage reference to download file
        const ref = this.storage.ref(filePath);
        ref.getDownloadURL().subscribe(url => {
          // get pdf document from url
          pdfjs.getDocument(url).then(pdfDoc_ => {
            const pdfDoc = pdfDoc_;
            // get metadata from pdf document
            pdfDoc.getMetadata().then(metadataObject => {
              this.meta1 = metadataObject;
              // save in bokconcepts the concetps from pdf metadata
              this.bokConcepts1 = this.getBokConceptsFromMeta(this.meta1);
              // do the matching
              this.match();
              console.log(this.meta1); // Metadata object here
            }).catch(function (err) {
              console.log('Error getting meta data');
              console.log(err);
            });
          }).catch(function (err) {
            console.log('Error getting PDF from url');
            console.log(err);
          });
        });
      })
    )
      .subscribe();
  }

  uploadFile2(file) {
    const filePath = 'other/custom-' + encodeURI(file.name);
    const task = this.storage.upload(filePath, file);

    this.uploadPercent2 = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        const ref = this.storage.ref(filePath);
        ref.getDownloadURL().subscribe(url => {
          pdfjs.getDocument(url).then(pdfDoc_ => {
            const pdfDoc = pdfDoc_;
            pdfDoc.getMetadata().then(metadataObject => {
              this.meta2 = metadataObject;
              console.log(this.meta2); // Metadata object here
              this.bokConcepts2 = this.getBokConceptsFromMeta(this.meta2);
              this.match();
            }).catch(function (err) {
              console.log('Error getting meta data');
              console.log(err);
            });
          }).catch(function (err) {
            console.log('Error getting PDF from url');
            console.log(err);
          });
        });
      })
    )
      .subscribe();
  }


  getBokConceptsFromMeta(meta) {
    const concepts = [];
    // concepts are in Subject metadata
    const rdf = meta.info.Subject.split(' ');
    rdf.forEach(rdfEl => {
      const rel = rdfEl.split(':');
      // if it's a eo4geo concept save the code
      if (rel[0] === 'eo4geo') {
        if (rel[1] !== '') {
          if (rel[1].endsWith(';')) {
            concepts.push(rel[1].slice(0, -1));
          } else {
            concepts.push(rel[1]);
          }
        }
      }
    });
    return concepts;
  }

  getBokConceptsFromResource(res) {
    // get concepts from resource in our database
    const concepts = [];
    res.concepts.forEach(c => {
      const rel = c.split(']');
      concepts.push(rel[0].slice(1));
    });
    return concepts;
  }

  match() {
    this.commonBokConcepts = [];
    if (this.bokConcepts1.length > 0 && this.bokConcepts2.length > 0) {
      this.bokConcepts1.forEach(bok1 => {
        if (this.bokConcepts2.indexOf(bok1 !== -1)) {
          this.commonBokConcepts.push(bok1);
        }
      });
      this.commonBokConcepts.forEach(bok => {
        const index1 = this.bokConcepts1.indexOf(bok);
        this.bokConcepts1.splice(index1, 1);
        const index2 = this.bokConcepts2.indexOf(bok);
        this.bokConcepts2.splice(index2, 1);
      });
      this.bokConcepts1.sort();
      this.bokConcepts2.sort();
      this.commonBokConcepts.sort();
    }
  }

}
