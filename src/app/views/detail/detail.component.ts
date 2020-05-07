import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OcupationalProfile } from '../../model/resources.model';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService, User } from '../../services/user.service';

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

  selectedProfile: OcupationalProfile;
  currentUser: User = new User();

  @ViewChild('dangerModal') public dangerModal: ModalDirective;

  constructor(
  /*   public occuprofilesService: OcuprofilesService, */
    private userService: UserService,
    private route: ActivatedRoute,
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
    this.getOccuProfileId();
  }

  getOccuProfileId(): void {
    const _id = this.route.snapshot.paramMap.get('name');
   /*  this.occuprofilesService
      .getOccuProfileById(_id)
      .subscribe(profile => {
        this.selectedProfile = profile;
        this.calculateStatistics();
      }); */
  }

  calculateStatistics() {
    if (this.selectedProfile) {
      const tempStats = {};
      let tempTotal = 0;
      this.selectedProfile.knowledge.forEach(kn => {
        const code = kn.slice(1, 3);
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statistics.push({ code: nameKA, value: Math.round(tempStats[k] * 100 / tempTotal) });
      });
    }
  }
}
