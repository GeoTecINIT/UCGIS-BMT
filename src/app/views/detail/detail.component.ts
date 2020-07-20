import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OcupationalProfile, Match } from '../../model/resources.model';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService, User } from '../../services/user.service';
import {MatchService} from '../../services/match.service';
import { AngularFireStorage } from '@angular/fire/storage';
import {BokService} from '../../services/bok.service';
import { Chart } from 'chart.js';
import { ChartConceptsDirective } from './chart-concepts.directive';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  statistics = [];
  isAnonymous = null;
  myChart = null;
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
    GI: 'Geographic Information Science and Technology'
  };

  selectedMatch: Match;
  currentUser: User = new User();
  skillsMatch: any[] = [];
  skillsNotMatch1: any[] = [];
  skillsNotMatch2: any[] = [];

  fieldsMatch: any[] = [];
  fieldsNotMatch1: any[] = [];
  fieldsNotMatch2: any[] = [];

  transvSkillsMatch: any[] = [];
  transvSkillsNotMatch1: any[] = [];
  transvSkillsNotMatch2: any[] = [];

  profileUrl: Observable<any>;
  @ViewChild('dangerModal') public dangerModal: ModalDirective;
  constructor(
    private matchService: MatchService,
    private userService: UserService,
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    public afAuth: AngularFireAuth,
    public bokService: BokService,
  ) {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.isAnonymous = user.isAnonymous;
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
        });
      } else {
        this.isAnonymous = true;
      }
    });
  }

  ngOnInit() {
    this.getMatchId();

  }
  getMatchId(): void {
    const _id = this.route.snapshot.paramMap.get('name');
    this.skillsMatch = [];
    this.fieldsMatch = [];
    this.transvSkillsMatch = [];
     this.matchService
      .getMatchById(_id)
      .subscribe(profile => {
        this.selectedMatch = profile;
        this.skillsNotMatch1 = [];
        this.skillsNotMatch2 = [];
        if (this.selectedMatch.resource1.skills.length > 0 ) {
          this.selectedMatch.resource1.skills.forEach(bok1 => {
            if (this.selectedMatch.resource2.skills && this.selectedMatch.resource2.skills.indexOf(bok1) !== -1) {
              this.skillsMatch.push(bok1);
            } else {
              this.skillsNotMatch1.push(bok1);
            }
          });
        }
        if (this.selectedMatch.resource2.skills && this.selectedMatch.resource2.skills.length > 0) {
          this.selectedMatch.resource2.skills.forEach(bok => {
            if (this.skillsMatch.indexOf(bok) < 0) {
              this.skillsNotMatch2.push(bok);
            }
          });
        }
        this.skillsMatch.sort();

        this.fieldsNotMatch1 = [];
        this.fieldsNotMatch2 = [];
        const fieldsResource1 = this.getFieldsFromResource(this.selectedMatch.resource1);
        const fieldsResource2 = this.getFieldsFromResource(this.selectedMatch.resource2);
        if (fieldsResource1.length > 0 ) {
          fieldsResource1.forEach(bok1 => {
            if (fieldsResource2.indexOf(bok1) !== -1) {
              this.fieldsMatch.push(bok1);
            } else {
              this.fieldsNotMatch1.push(bok1);
            }
          });
        }
        if (fieldsResource2.length > 0) {
          fieldsResource2.forEach(bok => {
            if (this.fieldsMatch.indexOf(bok) < 0) {
              this.fieldsNotMatch2.push(bok);
            }
          });
        }
        this.fieldsMatch.sort();

        this.transvSkillsNotMatch1 = [];
        this.transvSkillsNotMatch2 = [];
        const transversalSkills1 = this.getTransversalSkillsFromResource(this.selectedMatch.resource1);
        const transversalSkills2 = this.getTransversalSkillsFromResource(this.selectedMatch.resource2);
        if (transversalSkills1.length > 0 ) {
          transversalSkills1.forEach(bok1 => {
            if (transversalSkills2.indexOf(bok1) !== -1) {
              this.transvSkillsMatch.push(bok1);
            } else {
              this.transvSkillsNotMatch1.push(bok1);
            }
          });
        }
        if (transversalSkills2.length > 0) {
          transversalSkills2.forEach(bok => {
            if (this.transvSkillsMatch.indexOf(bok) < 0) {
              this.transvSkillsNotMatch2.push(bok);
            }
          });
        }
        this.transvSkillsMatch.sort();
      });
  }

  downloadResource(url: string) {
    const ref = this.storage.ref(url);
    this.profileUrl = ref.getDownloadURL();
    this.profileUrl.subscribe(response => {
      window.open( response, '_blank');
    });
  }

  removeMatch(id: string) {
    this.matchService.removeMatch(id);
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
}
