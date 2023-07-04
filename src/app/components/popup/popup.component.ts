import { Component, OnInit, Input } from '@angular/core';
import * as jsPDF from 'jspdf';
/* import { OcuprofilesService } from '../../services/ocuprofiles.service';
import { OcupationalProfile } from '../../ocupational-profile'; */
import { Base64img } from './base64img';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})

export class PopupComponent implements OnInit {

  constructor(private base64img: Base64img,
/*     public occuprofilesService: OcuprofilesService,
 */    private route: ActivatedRoute) { }

  public static END_PAGE_LINE = 284;
  restItems: any;

  @Input() idOP: any;
/*   selectedProfile: OcupationalProfile;
 */
  ngOnInit() {
    this.getOccuProfileId();
  }

  getOccuProfileId(): void {
   /*  this.occuprofilesService
      .getOccuProfileById(this.idOP)
      .subscribe(profile => {
        this.selectedProfile = profile;
      }); */
  }

  copyText() {
    let url = location.href;
    if (url.includes('list')) {
      url = url.replace('list', 'detail') + '/' + this.idOP;
    }
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

}
