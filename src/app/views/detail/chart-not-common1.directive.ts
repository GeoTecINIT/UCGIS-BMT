import { Directive, OnInit, ElementRef } from '@angular/core';
import {MatchService} from '../../services/match.service';
import {UserService} from '../../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {Match} from '../../model/resources.model';
import { Chart } from 'chart.js';

@Directive({
  selector: '[appChartNotCommon1]',

})
export class ChartNotCommon1Directive implements OnInit {

  selectedMatch: Match;
  myChart = null;
  statisticsNotMatching1 = [];
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
    this.statisticsNotMatching1 = [];
    if (this.selectedMatch.commonConcepts) {
      const tempStats2 = {};
      let tempTotal2 = 0;
      this.selectedMatch.notMatchConcepts1.forEach( nc => {
        const code = nc.code.slice(0, 2);
        tempStats2[code] !== undefined ? tempStats2[code]++ : tempStats2[code] = 1;
        tempTotal2++;
      });
      Object.keys(tempStats2).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statisticsNotMatching1.push({ code: nameKA, value: Math.round(tempStats2[k] * 100 / tempTotal2), count: tempStats2[k]  });
      });
    }
      this.graphStatistics(this.statisticsNotMatching1, this.el.nativeElement);
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
      'bok-AM': '#9999F8',
      'bok-CP': '#AEB9C8',
      'bok-CV': '#F19E70',
      'bok-DA': '#4EAEEA',
      'bok-DC': '#FBE7A3',
      'bok-DM': '#B1CF95',
      'bok-FC': '#F19E9C',
      'bok-GS': '#439798',
      'bok-KE': '#E4EEDC',
      'bok-PD': '#A3C1E3',
      'bok-UC': '#e4e4e4',
      'bok-no': '#e4e4e4'
    };
    return colors['bok-' + code];
  }
}
