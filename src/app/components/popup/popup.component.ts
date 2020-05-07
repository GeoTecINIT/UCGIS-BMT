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

  /* generatePDF() {
    let currentLinePoint = 45;
    // cabecera , imágenes
    const doc = new jsPDF();
    doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
    doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
    doc.link(15, 15, 600, 33, { url: 'http://www.eo4geo.eu' });
    doc.setFontSize(38);
    doc.setFontType('bold');
    doc.setTextColor('#1a80b6');
    if (this.selectedProfile.title != null) {
      const titleLines = doc.setFontSize(38).splitTextToSize(this.selectedProfile.title, 150);
      doc.text(30, currentLinePoint, titleLines);
      currentLinePoint = currentLinePoint + (15 * titleLines.length);
    }

    doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
    doc.text(30, currentLinePoint, 'EQF' + this.selectedProfile.eqf);
    currentLinePoint = currentLinePoint + 5;
    if (this.selectedProfile.fields != null && this.selectedProfile.fields.length > 1) {
      this.selectedProfile.fields.forEach(f => {
        doc.text(30, currentLinePoint, f.name + ' (' + f.grandparent + ')');
        currentLinePoint = currentLinePoint + 5;
      });
    }

    if (this.selectedProfile.description != null) {
      doc.setTextColor('#000').setFontType('normal');
      const lines = doc.setFontSize(10).splitTextToSize(this.selectedProfile.description, 150);
      doc.text(30, currentLinePoint, lines); // description
      currentLinePoint = currentLinePoint + 10 + (4 * lines.length);
    }
    // fecha
    // const d = new Date();
    // doc.text(90, 90, d.toLocaleDateString('es-ES'));

    if (this.selectedProfile.knowledge.length > 0) {
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'Knowledge required');
      currentLinePoint = currentLinePoint + 5;
      doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
      this.selectedProfile.knowledge.forEach(kn => {
        const knTitle = kn.split('] ')[1];
        const knLines = doc.setFontSize(8).splitTextToSize('· ' + knTitle, 150);
        doc.text(30, currentLinePoint, knLines);
        currentLinePoint = currentLinePoint + 4 * knLines.length;
      });
    }

    if (this.selectedProfile.skills.length > 0) {
      currentLinePoint = currentLinePoint + 10;
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'Skills required');
      currentLinePoint = currentLinePoint + 5;
      doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
      this.selectedProfile.skills.forEach(sk => {
        const skTitle = sk.split('] ')[1];
        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
        const skLines = doc.setFontSize(8).splitTextToSize('· ' + skTitle, 150);
        doc.text(30, currentLinePoint, skLines);
        currentLinePoint = currentLinePoint + 4 * skLines.length;
      });
    }

    if (this.selectedProfile.competences.length > 0) {
      currentLinePoint = currentLinePoint + 10;
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'Transversal skills required');
      currentLinePoint = currentLinePoint + 5;
      doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
      this.selectedProfile.competences.forEach(co => {
        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
        const coLines = doc.setFontSize(8).splitTextToSize('· ' + co.preferredLabel, 150);
        doc.text(30, currentLinePoint, coLines);
        currentLinePoint = currentLinePoint + 4 * coLines.length;
      });
    }

    // doc.textWithLink('asdfasdf', 20, 260, { url: 'https://' });
    doc.save('OccupationalProfile.pdf');
  }


  checkEndOfPage(line, doc) {
    if (line > PopupComponent.END_PAGE_LINE) {
      doc.addPage();
      doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
      doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
      line = 45;
    }
    return line;
  }

  getCompetences ( data: any ) {
    let resultCompetences = '';
    data.competences.forEach( competence => {
      resultCompetences = resultCompetences + '<rdf:li>' +
        '<rdf:Description rdf:about="' + competence.uri  + '">' +
        '<esco:skillType>' + competence.skillType + '</esco:skillType>' +
        '<esco:reuseLevel>' + competence.reuseLevel + '</esco:reuseLevel>' +
        '<esco:preferredLabel>' + competence.preferredLabel + '</esco:preferredLabel>' +
        '<esco:description>' + competence.description + '</esco:description>' +
        '</rdf:Description>' + ' </rdf:li>';
    });
    return resultCompetences;
  }

  getFields ( data: any ) {
    let resultFields = '';
    data.fields.forEach( field => {
      resultFields = resultFields + '<rdf:li>' + field.greatgrandparent + ' </rdf:li>' +
        '<rdf:li>' + field.code + ' </rdf:li>' +
        '<rdf:li>' + field.grandparent + ' </rdf:li>' +
        '<rdf:li>' + field.name + ' </rdf:li>' +
        '<rdf:li>' + field.concatName + ' </rdf:li>' +
        '<rdf:li>' + field.parent + ' </rdf:li>';
    });
    return resultFields;
  }

  getKnowledge ( data: any ) {
    const occPro = 'https://eo4geo-opt.web.app/#/detail/';
    let resultKnowledges = '';
    data.knowledge.forEach( know => {
      resultKnowledges = resultKnowledges + '<rdf:li>' +
        '<rdf:Description rdf:about="' + occPro + '">' +
        '<occPro:knowledge>' + know + '</occPro:knowledge>' +
        '</rdf:Description>' + ' </rdf:li>';
    });
    return resultKnowledges;
  }

  getSkills ( data: any ) {
    const urlSkills = 'https://eo4geo-opt.web.app/#/detail/';
    let resultSkills = '';
    data.skills.forEach( skill => {
      resultSkills = resultSkills + '<rdf:li>' +
        '<rdf:Description rdf:about="' + urlSkills + skill.split(']', 1)[0].split('[', 2)[1] + '">' +
        '<skill:skill>' + skill + '</skill:skill>' +
        '</rdf:Description>' + ' </rdf:li>';
    });
    return resultSkills;
  }

  createRDFFile(data: any) {
    const urlBase = 'https://eo4geo-opt.web.app/#/detail/';
    const esco = 'http://data.europa.eu/esco/skill/';
    const occPro = 'https://eo4geo-opt.web.app/#/detail/';
    const urlSkills = 'https://eo4geo-opt.web.app/#/detail/';
    const competences = this.getCompetences( this.selectedProfile);
    const fields = this.getFields( this.selectedProfile);
    const knowledge = this.getKnowledge( this.selectedProfile );
    const skills = this.getSkills( this.selectedProfile );
    const description = ' <rdf:Description ' +
      'rdf:about="' + urlBase + data._id + '">' +
      '<op:title>' + this.selectedProfile.title + '</op:title>' +
      '<op:description>' + this.selectedProfile.description + '</op:description>' +
      '<op:eqf>' + this.selectedProfile.eqf + '</op:eqf>' +
      '<op:orgName>' + this.selectedProfile.orgName + '</op:orgName>' +
      '<op:competences> <rdf:Bag rdf:ID="competences">' + competences + '</rdf:Bag> </op:competences>' +
      '<op:fields> <rdf:Bag rdf:ID="fields">' + fields + '</rdf:Bag> </op:fields>' +
      '<op:knowleges> <rdf:Bag rdf:ID="knowledge">' + knowledge + '</rdf:Bag> </op:knowleges>' +
      '<op:skills> <rdf:Bag rdf:ID="skills">' + skills + '</rdf:Bag> </op:skills>' +
      '</rdf:Description>';
    return '<?xml version="1.0"?>' +
      '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
      ' xmlns:esco="' + esco + '" ' +
      ' xmlns:occPro="' + occPro + '" ' +
      ' xmlns:skill="' + urlSkills + '" ' +
      ' xmlns:op="' + urlBase + '">' +
      description +
      '</rdf:RDF>';
  }
  generateRDF() {

    const data = this.createRDFFile(this.selectedProfile);
    const a = document.createElement('a');
    const blob = new Blob([data], {type: 'text/csv' }),
      url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = this.selectedProfile.title + '_rdf.rdf';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } */
}
