import { Directive, OnInit, ElementRef } from '@angular/core';
import {MatchService} from '../../services/match.service';
import {UserService} from '../../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {Match} from '../../model/resources.model';
import { Chart } from 'chart.js';

@Directive({
  selector: '[appChartNotCommon2]',

})
export class ChartNotCommon2Directive implements OnInit {

  selectedMatch: Match;
  myChart = null;
  statisticsNotMatching2 = [];
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
        this.calculateNotmatchingStatistics();
      });
  }

  calculateNotmatchingStatistics() {
    this.statisticsNotMatching2 = [];
    if (this.selectedMatch.commonConcepts) {
      const tempStats3 = {};
      let tempTotal3 = 0;
      this.selectedMatch.notMatchConcepts2.forEach( nc => {
        const code = nc.code.slice(0, 2);
        tempStats3[code] !== undefined ? tempStats3[code]++ : tempStats3[code] = 1;
        tempTotal3++;
      });
      Object.keys(tempStats3).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statisticsNotMatching2.push({ code: nameKA, value: Math.round(tempStats3[k] * 100 / tempTotal3), count: tempStats3[k]  });
      });
    }
    this.graphStatistics(this.statisticsNotMatching2, this.el.nativeElement);
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
      'bok-no': '#17becf'
    };
    return colors['bok-' + code];
  }
}
