import { Directive, OnInit, ElementRef } from '@angular/core';
import {MatchService} from '../../services/match.service';
import {UserService} from '../../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {Match} from '../../model/resources.model';
import { Chart } from 'chart.js';
import {BokService} from '../../services/bok.service';

@Directive({
  selector: '[appChartConcepts]',

})
export class ChartConceptsDirective implements OnInit {

  selectedMatch: Match;
  myChart = null;
  statistics = [];
  kaCodes = {
    AM: 'Analytics and Modeling',
    CP: 'Computing Platforms',
    CV: 'Cartography and Visualization',
    DA: 'Domain Applications',
    DC: 'Data Capture',
    DM: 'Data Management',
    FC: 'Foundational Concepts',
    GS: 'GIS& T and Society',
    KE: 'Knowledge Economy',
    PD: 'Programming and Development'
  };

  constructor( private el: ElementRef, private matchService: MatchService,
  private userService: UserService,
  private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getMatchId();
  }
  getMatchId(): void {
    const _id = this.route.snapshot.paramMap.get('name');
    this.matchService
      .getMatchById(_id)
      .subscribe(profile => {
        this.selectedMatch = profile;
        this.calculateStatistics();
      });
  }

  calculateStatistics() {
    if (this.selectedMatch) {
      const tempStats = {};
      let tempTotal = 0;
      this.selectedMatch.commonConcepts.forEach(kn => {
        const code = kn.code.slice(0, 2);
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statistics.push({ code: nameKA, value: Math.round(tempStats[k] * 100 / tempTotal), count: tempStats[k] });
      });
      this.graphStatistics(this.statistics, this.el.nativeElement);
    }
  }

  graphStatistics(statistics, chartId) {
    if (this.myChart !== null) {
      this.myChart.destroy();
    }
    const dataToGraph = [];
    const labelsToGraph = [];
    const colorsToGraph = [];
    statistics.forEach( st => {
      dataToGraph.push(st.count);
      labelsToGraph.push(st.code);
      colorsToGraph.push(this.getColor(st.code.slice(0, 2)));
    });
    this.myChart  = new Chart(chartId, {
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
      'bok-AM': '#8dd3c7',
      'bok-CP': '#ffffb3',
      'bok-CV': '#bebada',
      'bok-DA': '#fb8072',
      'bok-DC': '#80b1d3',
      'bok-DM': '#fdb462',
      'bok-FC': '#b3de69',
      'bok-GS': '#fccde5',
      'bok-KE': '#d9d9d9',
      'bok-PD': '#bc80bd',
      'bok-UC': '#ccebc5',
      'bok-no' : '#17becf'
    };
    return colors['bok-' + code];
  }
}




