import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Match, Resource } from '../../model/resources.model';
import { ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { User, UserService } from '../../services/user.service';
import { OrganizationService, Organization } from '../../services/organization.service';
import { MatchService } from '../../services/match.service';
import { ActivatedRoute } from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';

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
  @ViewChild('releaseNotesModal') public releaseNotesModal: any;


  constructor(
    private userService: UserService,
    public organizationService: OrganizationService,
    private matchService: MatchService,
    private route: ActivatedRoute,
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
                if (ma.userId === this.currentUser._id) {
                  this.matches.push(ma);
                }
              });
              // Sort by date
              this.matches.sort((a, b) => (a.updatedAt > b.updatedAt) ? 1 : -1);
              this.filteredMatches = this.matches;
            });
        });
      } else {
        this.isAnonymous = true;
        this.matches = [];
        this.filteredMatches = [];
      }
    });
  }

  ngOnInit() {
    if (this.route.snapshot.url[0].path === 'release-notes') {
      const config: ModalOptions = { backdrop: true, keyboard: true };
      this.releaseNotesModal.basicModal.config = config;
      this.releaseNotesModal.basicModal.show({});
    }
  }

  removeMatch(id: string) {
    this.matchService.removeMatch(id);
  }

  filter() {
    const search = this.searchText.toLowerCase();
    this.filteredMatches = [];
    this.filteredMatches = this.matches.filter(
      it =>
        it.title.toLowerCase().includes(search) ||
        it.description.toLowerCase().includes(search) ||
        it.orgName.toLowerCase().includes(search) ||
        it.division.toLowerCase().includes(search)
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
