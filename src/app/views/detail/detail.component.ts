import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OcupationalProfile, Match } from '../../model/resources.model';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService, User } from '../../services/user.service';
import {MatchService} from '../../services/match.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  statistics = [];
  isAnonymous = null;

  kaCodes = {
    GC: 'Geocomputation',
    WB: 'Web-based GI',
    GS: 'GI and Society',
    DA: 'Design and Setup of GI Systems',
    CV: 'Cartography and Visualization',
    OI: 'Organizational and Institutional Aspects',
    GD: 'Geospatial Data',
    CF: 'Conceptual Foundations',
    DM: 'Data Modeling, Storage and Exploitation',
    AM: 'Analytical Methods'
  };

  selectedProfile: Match;
  currentUser: User = new User();

  profileUrl: Observable<any>;
  @ViewChild('dangerModal') public dangerModal: ModalDirective;

  constructor(
    private matchService: MatchService,
    private userService: UserService,
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    public afAuth: AngularFireAuth
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
     this.matchService
      .getMatchById(_id)
      .subscribe(profile => {
        this.selectedProfile = profile;
        this.calculateStatistics();
      });
  }
  calculateStatistics() {
    if (this.selectedProfile) {
      const tempStats = {};
      let tempTotal = 0;
      this.selectedProfile.commonConcepts.forEach(kn => {
        const code = kn.slice(0, 2);
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statistics.push({ code: nameKA, value: Math.round(tempStats[k] * 100 / tempTotal) });
      });
    }
  }
  downloadResource(url: string) {
    let ref = this.storage.ref(url);
    this.profileUrl = ref.getDownloadURL();
    this.profileUrl.subscribe(response => {
      window.open( response, '_blank');
    });

  }
}
