
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Match, Resource } from '../../model/resources.model';
import { MatchService } from '../../services/match.service';
import { OtherService } from '../../services/other.service';
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
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { Chart } from 'chart.js';
import { AngularFireDatabase } from '@angular/fire/database';

// import * as fs from 'fs';
// import * as parsePdf from 'parse-pdf';

// const fs = require('fs');
// const parsePdf = require('parse-pdf');

// import * as jspdf from 'parse-pdf';

import * as pdfjs from 'pdfjs-dist';
import { BokService } from '../../services/bok.service';
import {LoginComponent} from '../login/login.component';

@Component({
  selector: 'app-newmatch',
  templateUrl: './newmatch.component.html',
  styleUrls: ['./newmatch.component.scss']
})
export class NewmatchComponent implements OnInit {

  model = new Match('', '', '', '', '', '', true, null, null, null, null, null, null, null);

  selectedMatch: Match;
  _id: string;
  mode: string;
  title: string;
  allConcepts = [];

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
  filteredByType1 = [];
  filteredByType2 = [];
  selectedResources = [];

  meta1 = null;
  meta2 = null;

  bokConcepts1 = [];
  bokConcepts2 = [];
  commonBokConcepts = [];
  notMatchConcepts1 = [];
  notMatchConcepts2 = [];

  skills1 = [];
  skills2 = [];
  commonSkills = [];
  conceptsName = [];
  notMatchSkills1 = [];
  notMatchSkills2 = [];

  fields1 = [];
  fields2 = [];
  commonFields = [];
  notMatchFields1 = [];
  notMatchFields2 = [];

  transversalSkills1 = [];
  transversalSkills2 = [];
  commonTransversalSkills = [];
  notMatchTransversal1 = [];
  notMatchTransversal2 = [];

  numberOsConcepts1 = [];
  numberOsConcepts2 = [];

  resource1 = null;
  resource2 = null;

  uploadPercent1 = null;
  uploadPercent2 = null;

  errorFile1 = false;
  errorFile2 = false;

  statisticsMatching = [];
  statisticsNotMatching1 = [];
  statisticsNotMatching2 = [];
  statisticsSkills = [];
  statisticsTransversalSkills = [];
  statisticsFields = [];

  statNumberOfConcepts1 = [];
  statNumberOfConcepts2 = [];

  modalRef: BsModalRef;
  myChart = null;
  notMatchChart1 = null;
  notMatchChart2 = null;
  isAnonymous = true;
  type = -1;
  type2 = -1;
  kaCodes = {
    AM: 'Analytical Methods',
    CF: 'Conceptual Foundations',
    CV: 'Cartography and Visualization',
    DA: 'Design and Setup of Geographic Information Systems',
    DM: 'Data Modeling, Storage and Exploitation',
    GC: 'Geocomputation',
    GD: 'Geospatial Data',
    GS: 'GI and Society',
    IP: 'Image processing and analysis',
    OI: 'Organizational and Institutional Aspects',
    PP: 'Physical principles',
    PS: 'Platforms, sensors and digital imagery',
    TA: 'Thematic and application domains',
    WB: 'Web-based GI',
    GI: 'Geographic Information Science and Technology',
  };

  formGroup = this.fb.group({
    file: [null, Validators.required]
  });

  public LIMIT_PER_PAGE = 6;
  public paginationLimitFrom1 = 0;
  public paginationLimitFrom2 = 0;
  public paginationLimitTo1 = this.LIMIT_PER_PAGE;
  public paginationLimitTo2 = this.LIMIT_PER_PAGE;
  public currentPage1 = 0;
  public currentPage2 = 0;
  public collectionOT = 'Other';

  constructor(
    private matchService: MatchService,
    private otherService: OtherService,
    private organizationService: OrganizationService,
    private userService: UserService,
    public fieldsService: FieldsService,
    public escoService: EscoCompetenceService,
    public resourceService: ResourceService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    // private cd: ChangeDetectorRef,
    private storage: AngularFireStorage,
    public bokService: BokService,
    private modalService: BsModalService,
    private dbRealTime: AngularFireDatabase

  ) {
    this.isAnonymous = false;
      this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
          if (this.currentUser.organizations && this.currentUser.organizations.length > 0) {
            this.currentUser.organizations.forEach(orgId => {
              this.organizationService.getOrganizationById(orgId).subscribe(org => {
                if (org) {
                  this.userOrgs.push(org);
                  this.saveOrg = this.userOrgs[0];
                  // remove private not your org resources
                  this.resourceService.allResources = this.resourceService.allResources.filter(
                    it =>
                      this.currentUser.organizations.includes(it.orgId) || it.isPublic
                  );
                  this.isAnonymous = true;
                }
              });
            });
          }
        });
      }
    });
    // sort resources by name
    this.resourceService.allResources.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
    this.filteredResources1 = this.resourceService.allResources;
    this.filteredResources2 = this.resourceService.allResources;
  }

  ngOnInit() {
    this.getMode();
  }

  saveMatch() {
    if (this.mode === 'copy') {
      this.matchService.updateMatch(this._id, this.model);
    } else {
      this.model.userId = this.afAuth.auth.currentUser.uid;
      this.model.commonConcepts = this.commonBokConcepts;
      this.model.notMatchConcepts1 = this.notMatchConcepts1;
      this.model.notMatchConcepts2 = this.notMatchConcepts2;
      this.model.resource1 = this.resource1;
      this.model.resource2 = this.resource2;
      this.model.orgId = this.saveOrg._id;
      this.model.orgName = this.saveOrg.name;
      if (this.model.resource1._id == null) {
        this.model.resource1.type = 3;
        this.otherService.addNewOther(this.model.resource1);
      }
      if (this.model.resource2._id == null) {
        this.model.resource2.type = 3;
        this.otherService.addNewOther(this.model.resource2);
      }
      // reload resources
      this.resourceService.getResources();
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
      this.title = 'Match two BoK resources';
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
    this.paginationLimitFrom1 = 0;
    this.paginationLimitTo1 = this.LIMIT_PER_PAGE;
    this.currentPage1 = 0;
    if ( this.type === -1 ) {
      this.filteredByType1 = this.resourceService.allResources;
    }
    this.filteredResources1 = this.filteredByType1.filter(
      it =>
        it.name.toLowerCase().includes(this.searchText1.toLowerCase()) ||
        it.description.toLowerCase().includes(this.searchText1.toLowerCase())
    );
  }

  filter2() {
    this.paginationLimitFrom2 = 0;
    this.paginationLimitTo2 = this.LIMIT_PER_PAGE;
    this.currentPage2 = 0;
    if ( this.type2 === -1 ) {
      this.filteredByType2 = this.resourceService.allResources;
    }
    this.filteredResources2 = this.filteredByType2.filter(
      it =>
        it.name.toLowerCase().includes(this.searchText2.toLowerCase()) ||
        it.description.toLowerCase().includes(this.searchText2.toLowerCase())
    );
  }

  onFileChange1(event) {
    // empty filtered resources to hide EO4GEO content
    this.filteredResources1 = [];
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      [this.file1] = event.target.files;
      // console.log('onFileChange2');
      // console.log(this.file2);
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
      // console.log('onFileChange2');
      // console.log(this.file2);
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
    this.getRelations();
    this.notMatchConcepts1 = [];
    this.conceptsName = [];
    this.bokConcepts1 = this.getBokConceptsFromResource(res);
    this.skills1 = this.getSkillsFromResource(res);
    this.fields1 = this.getFieldsFromResource(res);
    this.transversalSkills1 = this.getTransversalSkillsFromResource(res);
    this.bokConcepts1.forEach( k => {
      this.notMatchConcepts1.push(k.code);
      this.conceptsName[k.code] = k.name;
    });
    this.notMatchSkills1 = this.skills1;
    this.notMatchFields1 = this.fields1;
    this.notMatchTransversal1 = this.transversalSkills1;
    this.resource1 = res;
    this.match();
    this.getStatisticsNumberOfConcepts();
  }

  selectResource2(res) {
    this.getRelations();
    this.notMatchConcepts2 = [];
    this.conceptsName = [];
    this.bokConcepts2 = this.getBokConceptsFromResource(res);
    this.skills2 = this.getSkillsFromResource(res);
    this.fields2 = this.getFieldsFromResource(res);
    this.transversalSkills2 = this.getTransversalSkillsFromResource(res);
    this.bokConcepts2.forEach( k => {
      this.notMatchConcepts2.push(k.code);
      this.conceptsName[k.code] = k.name;
    });
    this.notMatchSkills2 = this.skills2;
    this.notMatchFields2 = this.fields2;
    this.notMatchTransversal2 = this.transversalSkills2;
    this.resource2 = res;
    this.match();
    this.getStatisticsNumberOfConcepts();
  }

  uploadFile1(file) {
    const filePath = 'other/custom-' + encodeURI(file.name);
    // upload file to firebase storage
    const task = this.storage.upload(filePath, file);
    this.errorFile1 = false;
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
              if (this.bokConcepts1.length === 0) {
                this.errorFile1 = true;
              }
              this.bokConcepts1.forEach( k => {
                this.notMatchConcepts1.push(k.code);
              });
              this.resource1 = new Resource(null, url, this.currentUser._id, this.saveOrg._id, this.saveOrg.name, this.collectionOT,
                this.collectionOT, true, true, this.meta1.info['Title'], this.meta1.info['Title'], '',
                this.bokConcepts1, null, null, null, null, 3);
              // do the matching
              this.match();
              console.log(this.meta1); // Metadata object here
              console.log('EL EQF!!!!', this.resource1);
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

    this.errorFile2 = false;
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
              if (this.bokConcepts2.length === 0) {
                this.errorFile2 = true;
              }
              this.bokConcepts2.forEach( k => {
                this.notMatchConcepts2.push(k.code);
              });
              this.resource2 = new Resource(null, url, this.currentUser._id, this.saveOrg._id, this.saveOrg.name, this.collectionOT,
                this.collectionOT, true, true, this.meta2.info['Title'], this.meta2.info['Title'], '',
                this.bokConcepts2, null, null, null, null, 3);
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
    if (meta && meta.info && meta.info.Subject) {
      const rdf = meta.info.Subject.split(' ');
      rdf.forEach(rdfEl => {
        const rel = rdfEl.split(':');
        // if it's a eo4geo concept save the code
        if (rel[0] === 'eo4geo') {
          if (rel[1] !== '') {
            if (rel[1].endsWith(';')) {
              concepts.push({code: rel[1].slice(0, -1), name: rdfEl});
            } else {
              concepts.push({code: rel[1], name: rdfEl});
            }
          }
        }
      });
    }

    return concepts;
  }

  getBokConceptsFromResource(res) {
    // get concepts from resource in our database
    const concepts = [];
    const codConcepts = [];
    if (res && res.concepts && res.concepts.length > 0) {
      res.concepts.forEach(c => {
        const rel = c.split(']');
        if (  rel[0][0] === '['  ) {
          const concept = rel[0].slice(1);
          if (codConcepts.indexOf(concept) === -1) {
            concepts.push({code: rel[0].slice(1), name: c});
            codConcepts.push(rel[0].slice(1));
          }
        } else {
          concepts.push({code: rel[0], name: c });
          codConcepts.push(rel[0]);
        }
      });
    }
    return concepts;
  }
  getSkillsFromResource(res) {
    const skills = [];
    if ( res.type ===  0 ) {
      if (res && res.learningObjectives && res.learningObjectives.length > 0) {
        res.learningObjectives.forEach(c => {
          let code =  c.concept_id.split(']');
          let skill = '';
            skill = c.name;
          skills.push(skill);
        });
      }
    } else {
      if (res && res.skills && res.skills.length > 0) {
        res.skills.forEach(c => {
          skills.push(c);
        });
      }
    }
    return skills;
  }

  getFieldsFromResource(res) {
    // get fields from resource in our database
    const fields = [];
    if (res && res.fields && res.fields.length > 0) {
      res.fields.forEach(c => {
        fields.push(c.name);
      });
    } else if (!res.fields && res.occuProf && res.occuProf.fields) {
      res.occuProf.fields.forEach(c => {
        fields.push(c.name);
      });
    } else if (!res.fields && res.occuProf ) {
      fields.push(res.occuProf.field.name);
    }  else if (!res.fields && res.field ) {
      fields.push(res.field.name);
    }
    return fields;
  }

  getTransversalSkillsFromResource(res) {
    // get Transversal Skills from resource in our database
    const transversalSkills = [];
    if (res && res.competences && res.competences.length > 0) {
      res.competences.forEach(c => {
        transversalSkills.push(c.preferredLabel);
      });
    } else if (!res.competences && res.occuProf && res.occuProf.competences) {
      res.occuProf.competences.forEach(c => {
        transversalSkills.push(c.preferredLabel);
      });
    } else if (res.competences && res.competences.preferredLabel && !res.occuProf ) {
      transversalSkills.push(res.occuProf.competences.preferredLabel);
    }
    return transversalSkills;
  }
  match() {
    this.commonBokConcepts = [];
    if (this.bokConcepts1.length > 0 && this.bokConcepts2.length > 0) {
      this.notMatchConcepts1 = [];
      this.notMatchConcepts2 = [];
      this.conceptsName = [];
      this.bokConcepts1.forEach(bok1 => {
        let found = false;
        this.bokConcepts2.forEach(bok2 => {
          if (bok1.code === bok2.code) {
            this.commonBokConcepts.push(bok1.code);
            this.conceptsName[bok1.code] = bok1.name;
            found = true;
          }
        });
        if (!found ) {
          this.notMatchConcepts1.push(bok1.code);
          this.conceptsName[bok1.code] = bok1.name;
        }
      });
      this.bokConcepts2.forEach(bok => {
        let found = false;
        this.bokConcepts1.forEach(bok2 => {
          if (bok.code === bok2.code) {
            found = true;
          }
        });
        if (!found ) {
          this.conceptsName[bok.code] = bok.name;
          this.notMatchConcepts2.push(bok.code);
        }
      });
      this.notMatchConcepts1.sort();
      this.notMatchConcepts2.sort();
      this.commonBokConcepts.sort();
    }
    this.commonSkills = [];
    if (this.skills1.length > 0 && this.skills2.length > 0 ) {
      this.notMatchSkills1 = [];
      this.notMatchSkills2 = [];
      this.skills1.forEach(bok1 => {
        if (this.skills2.indexOf(bok1) !== -1) {
          this.commonSkills.push(bok1);
        } else {
          this.notMatchSkills1.push(bok1);
        }
      });
      this.skills2.forEach(bok => {
        if (this.commonSkills.indexOf(bok) < 0) {
          this.notMatchSkills2.push(bok);
        }
      });
      this.commonSkills.sort();
    }

    this.commonFields = [];
    if (this.fields1.length > 0 && this.fields2.length > 0 ) {
      this.notMatchFields1 = [];
      this.notMatchFields2 = [];
      this.fields1.forEach(bok1 => {
        if (this.fields2.indexOf(bok1) !== -1) {
          this.commonFields.push(bok1);
        } else {
          this.notMatchFields1.push(bok1);
        }
      });
      this.fields2.forEach(bok => {
        if (this.commonFields.indexOf(bok) < 0) {
          this.notMatchFields2.push(bok);
        }
      });
      this.commonFields.sort();
    }

    this.commonTransversalSkills = [];
    if (this.transversalSkills1.length > 0 && this.transversalSkills2.length > 0 ) {
      this.notMatchTransversal1 = [];
      this.notMatchTransversal2 = [];
      this.transversalSkills1.forEach(bok1 => {
        if (this.transversalSkills2.indexOf(bok1) !== -1) {
          this.commonTransversalSkills.push(bok1);
        } else {
          this.notMatchTransversal1.push(bok1);
        }
      });
      this.transversalSkills2.forEach(bok => {
        if (this.commonTransversalSkills.indexOf(bok) < 0) {
          this.notMatchTransversal2.push(bok);
        }
      });
      this.commonTransversalSkills.sort();
    }

    this.calculateStatistics();
  }

  calculateStatistics() {
    this.statisticsMatching = [];
    if (this.commonBokConcepts) {
      const tempStats = {};
      let tempTotal = 0;
      this.commonBokConcepts.forEach(kn => {
        let code = this.getParent(kn);
        if ( code === undefined ) {
          code = kn.slice(0, 2);
        }
        if ( code === 'GIST' ) {
          code = kn;
        }
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statisticsMatching.push({ code: nameKA, value: Math.round(tempStats[k] * 100 / tempTotal), count: tempStats[k] });
      });
      this.graphStatistics(this.statisticsMatching, 'myChart');
      this.calculateNotmatchingStatistics();
      this.calculateSkillsStatistics();
      this.calculateFieldsStatistics();
    }
  }

  calculateNotmatchingStatistics() {
    this.statisticsNotMatching1 = [];
    this.statisticsNotMatching2 = [];
    if (this.commonBokConcepts) {
      const tempStats2 = {};
      let tempTotal2 = 0;
      this.notMatchConcepts1.forEach( nc => {
        let code = this.getParent(nc);
        if ( code === undefined ) {
          code = nc.slice(0, 2);
        }
        if ( code === 'GIST' ) {
          code = nc;
        }
        tempStats2[code] !== undefined ? tempStats2[code]++ : tempStats2[code] = 1;
        tempTotal2++;
      });
      Object.keys(tempStats2).forEach(k => {
        let nameKA = '';
        if (  this.kaCodes[k] !== undefined ) {
           nameKA = k + ' - ' + this.kaCodes[k];
        } else {
          const nameConcept = this.conceptsName[k];
          nameKA = k + ' - ' + nameConcept.split(']')[1];
        }
        this.statisticsNotMatching1.push({ code: nameKA, value: Math.round(tempStats2[k] * 100 / tempTotal2), count: tempStats2[k]  });
      });
      const tempStats3 = {};
      let tempTotal3 = 0;
      this.notMatchConcepts2.forEach( nc => {
        let code = this.getParent(nc);
        if ( code === undefined ) {
          code = nc.slice(0, 2);
        }
        if ( code === 'GIST' ) {
          code = nc;
        }
        tempStats3[code] !== undefined ? tempStats3[code]++ : tempStats3[code] = 1;
        tempTotal3++;
      });
      Object.keys(tempStats3).forEach(k => {
        let nameKA = '';
        if (  this.kaCodes[k] !== undefined ) {
          nameKA = k + ' - ' + this.kaCodes[k];
        } else if (this.conceptsName[k] !== undefined) {
          const nameConcept = this.conceptsName[k];
          nameKA = k + ' - ' + nameConcept.split(']')[1];
        }
        this.statisticsNotMatching2.push({ code: nameKA, value: Math.round(tempStats3[k] * 100 / tempTotal3), count: tempStats3[k]  });
      });
    }
    this.graphStatisticsNotMatch1(this.statisticsNotMatching1, 'notMatch1');
    this.graphStatisticsNotMatch2(this.statisticsNotMatching2, 'notMatch2');
  }
  calculateSkillsStatistics () {
    this.statisticsSkills = [];
    if (this.commonSkills) {
      const tempStats = {};
      let tempTotal = 0;
      this.commonSkills.forEach( nc => {
        let code = this.getParent(nc);
        if ( code === undefined ) {
          code = nc.slice(0, 2);
        }
        if ( code === 'GIST' ) {
          code = nc;
        }
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statisticsSkills.push({ code: nameKA, value: Math.round(tempStats[k] * 100 / tempTotal) });
      });
    }
  }
  calculateFieldsStatistics () {
    this.statisticsFields = [];
    if (this.commonFields) {
      const tempStats = {};
      let tempTotal = 0;
      this.commonFields.forEach( nc => {
        const code = nc;
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        this.statisticsFields.push({ code: k, value: Math.round(tempStats[k] * 100 / tempTotal) });
      });
    }
  }
  range(size, startAt = 0) {
    size = Math.ceil(size);
    if (size === 0) {
      size = 1;
    }
    return [...Array(size).keys()].map(i => i + startAt);
  }

  nextPage1() {
    if (this.currentPage1 + 1 < this.filteredResources1.length / this.LIMIT_PER_PAGE) {
      this.paginationLimitFrom1 = this.paginationLimitFrom1 + this.LIMIT_PER_PAGE;
      this.paginationLimitTo1 = this.paginationLimitTo1 + this.LIMIT_PER_PAGE;
      this.currentPage1++;
    }
  }

  previousPage1() {
    if (this.currentPage1 > 0) {
      this.paginationLimitFrom1 = this.paginationLimitFrom1 - this.LIMIT_PER_PAGE;
      this.paginationLimitTo1 = this.paginationLimitTo1 - this.LIMIT_PER_PAGE;
      this.currentPage1--;
    }
  }
  nextPage2() {
    if (this.currentPage2 + 1 < this.filteredResources1.length / this.LIMIT_PER_PAGE) {
      this.paginationLimitFrom2 = this.paginationLimitFrom2 + this.LIMIT_PER_PAGE;
      this.paginationLimitTo2 = this.paginationLimitTo2 + this.LIMIT_PER_PAGE;
      this.currentPage2++;
    }
  }

  previousPage2() {
    if (this.currentPage2 > 0) {
      this.paginationLimitFrom2 = this.paginationLimitFrom2 - this.LIMIT_PER_PAGE;
      this.paginationLimitTo2 = this.paginationLimitTo2 - this.LIMIT_PER_PAGE;
      this.currentPage2--;
    }
  }

  filterByType(array, type) {
    if (array === 1) {
      this.paginationLimitFrom1 = 0;
      this.paginationLimitTo1 = this.LIMIT_PER_PAGE;
      this.currentPage1 = 0;
      this.filteredResources1 = [];
      if (type === -1) {
        this.filteredResources1 = this.resourceService.allResources;
      } else {
        this.filteredResources1 = this.resourceService.allResources.filter(
          it =>
            it.type === type
        );
        this.filteredByType1 = this.filteredResources1;
      }
      this.type = type;
    } else {
      this.paginationLimitFrom2 = 0;
      this.paginationLimitTo2 = this.LIMIT_PER_PAGE;
      this.currentPage2 = 0;
      this.filteredResources2 = [];
      if (type === -1) {
        this.filteredResources2 = this.resourceService.allResources;
      } else {
        this.filteredResources2 = this.resourceService.allResources.filter(
          it =>
            it.type === type
        );
        this.filteredByType2 = this.filteredResources2;
      }
      this.type2 = type;
    }
  }

  deleteOtherRes(idOther) {
    this.otherService.removeOther(idOther);

    console.log('delete other resource: ' + idOther);

    this.resourceService.allResources = this.resourceService.allResources.filter(
      it =>
        it._id !== idOther
    );
    this.filteredResources1 = this.filteredResources1.filter(
      it =>
        it._id !== idOther
    );
    this.filteredResources2 = this.filteredResources2.filter(
      it =>
        it._id !== idOther
    );

  }
  openModal() {
    this.modalRef = this.modalService.show(LoginComponent, {class: 'modal-lg'});
  }

  graphStatistics(statistics, chartId) {
      if (this.myChart !== null) {
        this.myChart.destroy();
      }
      const ctx = document.getElementById(chartId);
      const dataToGraph = [];
      const labelsToGraph = [];
      const colorsToGraph = [];
      statistics.forEach( st => {
        dataToGraph.push(st.count);
        labelsToGraph.push(st.code);
        colorsToGraph.push(this.getColor(st.code.slice(0, 2)));
      });
      this.myChart  = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: dataToGraph,
            backgroundColor: colorsToGraph
          }],
          labels: labelsToGraph
        },
        options: {
        }
      });
  }

  graphStatisticsNotMatch1(statistics, chartId) {
    if (this.notMatchChart1 !== null) {
      this.notMatchChart1 .destroy();
    }
    const ctx = document.getElementById(chartId);
    const dataToGraph = [];
    const labelsToGraph = [];
    const colorsToGraph = [];
    statistics.forEach( st => {
      dataToGraph.push(st.count);
      labelsToGraph.push(st.code);
      colorsToGraph.push(this.getColor(st.code.slice(0, 2)));
    });
    this.notMatchChart1  = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: dataToGraph,
          backgroundColor: colorsToGraph
        }],
        labels: labelsToGraph
      },
      options: {
      }
    });
  }
  graphStatisticsNotMatch2(statistics, chartId) {
    if (this.notMatchChart2 !== null) {
      this.notMatchChart2 .destroy();
    }
    console.log('Estadisticas!!!', statistics);
    const ctx = document.getElementById(chartId);
    const dataToGraph = [];
    const labelsToGraph = [];
    const colorsToGraph = [];
    statistics.forEach( st => {
      dataToGraph.push(st.count);
      labelsToGraph.push(st.code);
      colorsToGraph.push(this.getColor(st.code.slice(0, 2)));
    });
    this.notMatchChart2  = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: dataToGraph,
          backgroundColor: colorsToGraph
        }],
        labels: labelsToGraph
      },
      options: {
      }
    });
  }
  getColor(code) {
    const colors = {
      'bok-GI' : '#40e0d0',
      'bok-IP' : '#1f77b4',
      'bok-CF' : '#aec7e8',
      'bok-CV' : '#ff7f0e',
      'bok-DA' : '#ffbb78',
      'bok-DM' : '#2ca02c',
      'bok-DN' : '#98df8a',
      'bok-PS' : '#d62728',
      'bok-GD' : '#cc5b59',
      'bok-GS' : '#9467bd',
      'bok-AM' : '#8c564b',
      'bok-MD' : '#8c564b',
      'bok-OI' : '#c49c94',
      'bok-GC' : '#e377c2',
      'bok-PP' : '#f7b6d2',
      'bok-SD' : '#7f7f7f',
      'bok-SH' : '#c7c7c7',
      'bok-TA' : '#bcbd22',
      'bok-WB' : '#07561e',
      'bok-no' : '#17becf',
    };
    return colors['bok-' + code];
  }

  getRelations() {
    const allConcepts = this.bokService.getConcepts();
    const allRelations = this.bokService.getRelations();
    this.allConcepts = this.bokService.getRelationsPrent(allRelations, allConcepts);
  }

  getParent( concept ) {
    let parentCode = '';
    let parentNode = [];
    this.allConcepts.forEach( con => {
      if ( con.code === concept ) {
        parentNode = con;
        while ( parentCode !== 'GIST' && parentNode['code'] !== 'GIST' ) {
          parentNode = parentNode['parent'];
          parentCode = parentNode['parent']['code'];
        }
      }
    });
    return parentNode['code'];
  }

  getStatisticsNumberOfConcepts() {
    this.numberOsConcepts1 = this.getNumberOfConcepts( this.bokConcepts1);
    this.numberOsConcepts2 = this.getNumberOfConcepts( this.bokConcepts2);
    let numberCommonConcepts = [];
    numberCommonConcepts = this.getNumberOfConcepts( this.commonBokConcepts);
    this.statNumberOfConcepts1 = [];
    this.statNumberOfConcepts2 = [];
    let percentage1 = 0;
    let percentage2 = 0;
    Object.keys(numberCommonConcepts).forEach( bokConcept => {

      percentage1 = ( Math.round((numberCommonConcepts[bokConcept] * 100)   / this.numberOsConcepts1[bokConcept]));
      this.statNumberOfConcepts1.push({ code: bokConcept, value: percentage1, numberCommon: numberCommonConcepts[bokConcept],
        numberCon: this.numberOsConcepts1[bokConcept] });

      percentage2 = ( Math.round((numberCommonConcepts[bokConcept] * 100 )  / this.numberOsConcepts2[bokConcept]));
      this.statNumberOfConcepts2.push({ code: bokConcept, value: percentage2, numberCommon: numberCommonConcepts[bokConcept],
        numberCon: this.numberOsConcepts2[bokConcept] });
    });

  }
  getNumberOfConcepts( conceptsToAnalize ) {
    const numConcepts = [];
    let i = 0;

    conceptsToAnalize.forEach(bok1 => {
      let parent = '';
      if ( bok1.code ) {
        parent = this.getParent(bok1.code);
      } else {
        parent = this.getParent(bok1);
      }
      if ( this.kaCodes[parent] !== undefined) {
        i = numConcepts[parent] !== undefined ? numConcepts[parent] + 1 : 1;
        numConcepts[parent] = i ;
      }
    });
    return numConcepts;
  }
}
