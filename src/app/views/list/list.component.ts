import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Match,  Resource} from '../../model/resources.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { User, UserService } from '../../services/user.service';
import { OrganizationService } from '../../services/organization.service';
import {MatchService} from '../../services/match.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  matches: Match[];
  advancedSearch = false;
  filteredMatches: any[];
  searchText: string;
  knowledgeFilter: Boolean = true;
  isAnonymous = null;
  currentUser: User = new User();
  @ViewChild('dangerModal') public dangerModal: ModalDirective;

  constructor(
    private userService: UserService,
    public organizationService: OrganizationService,
    private matchService: MatchService,
    public afAuth: AngularFireAuth) {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.isAnonymous = user.isAnonymous;
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
           this.matchService
          .subscribeToMatches()
          .subscribe(matches => {
            this.matches = [];
            matches.forEach(ma => {
              if (ma.isPublic) {
                this.matches.push(ma);
              } else if (this.currentUser && this.currentUser.organizations && this.currentUser.organizations.indexOf(ma.orgId) > -1) {
                this.matches.push(ma);
              }
            });
            this.filteredMatches = this.matches;
          });
        });
      } else {
        this.isAnonymous = true;
      }
       this.matchService
        .subscribeToMatches()
        .subscribe(occuProfiles => {
          this.matches = [];
          occuProfiles.forEach(op => {
            if (op.isPublic) {
              this.matches.push(op);
            }
          });
          this.filteredMatches = this.matches;
        });
    });
  }

  ngOnInit() {
    /*  this.occuprofilesService
       .subscribeToOccupationalProfiles()
       .subscribe(occuProfiles => {
         this.occupationalProfiles = occuProfiles;
         this.filteredOccuProfiles = occuProfiles;
       }); */
  }

  removeOccuProfile(id: string) {
     this.matchService.removeMatch(id);
   }

  filter() {
    const search = this.searchText.toLowerCase();
    this.filteredMatches = [];
    this.filteredMatches = this.matches.filter(
      it =>
        it.title.toLowerCase().includes(search) ||
        it.description.toLowerCase().includes(search)
    );
    if (this.advancedSearch) {
      this.applyFilters();
    }
  }

  applyFilters() {
     this.matches.forEach(mat => {
      if (this.knowledgeFilter) {
        mat.commonConcepts.forEach(know => {
          if (know.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (this.filteredMatches.indexOf(mat) === -1) {
              this.filteredMatches.push(mat);
            }
          }
        });
      }
    });
  }
}
