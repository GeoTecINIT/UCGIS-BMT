import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EscoCompetenceService {
  public allcompetences: any;

  // TODO: Retrieve this from the DB
  public basicCompetences = [
    { preferredLabel: 'Adapt to change' },
    { preferredLabel: 'Assertiveness' },
    { preferredLabel: 'Attend to detail' },
    { preferredLabel: 'Customer relationship management' },
    { preferredLabel: 'Demonstrate intercultural competence' },
    { preferredLabel: 'Demonstrate willingness to learn' },
    { preferredLabel: 'Develop company strategies' },
    { preferredLabel: 'Develop strategy to solve problems' },
    { preferredLabel: 'Digital competencies' },
    { preferredLabel: 'Identify opportunities' },
    { preferredLabel: 'Interact with others' },
    { preferredLabel: 'Cope with pressure' },
    { preferredLabel: 'Lead others' },
    { preferredLabel: 'Make decisions' },
    { preferredLabel: 'Manage frustration' },
    { preferredLabel: 'Listen actively' },
    { preferredLabel: 'Manage time' },
    { preferredLabel: 'Meet commitments' },
    { preferredLabel: 'Motivate others' },
    { preferredLabel: 'Report facts' },
    { preferredLabel: 'Show enterpreneurial spirit' },
    { preferredLabel: 'Team building' },
    { preferredLabel: 'Think creatively' },
    { preferredLabel: 'Think proactively' },
    { preferredLabel: 'Work efficiently' },
    { preferredLabel: 'Work in an international environment' },
    { preferredLabel: 'Work independently' }
  ];

  constructor(private http: HttpClient) {
    this.http.get('assets/json/esco.json').subscribe((data) => {
      this.allcompetences = data;
    });
  }
}
