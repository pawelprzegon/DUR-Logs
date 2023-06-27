import AbstractView from './AbstractView.js';
import { callApiGet } from '../endpoints.js';
import { Latex_All_Data } from '../createLatexTables.js';
import { createChart } from '../chart/createChart.js';
import { Alerts } from '../alerts/alerts.js';
import {
  hideloader,
  removeDbSettings,
  showloader,
  NoDataFound,
} from '../common.js';

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle('Latex');
  }

  async getData() {
    document.querySelector('#app').innerHTML = '';
    try {
      showloader();
      let app = document.querySelector('#app');
      let newChart = new createChart();
      newChart.getData();
      let chart = newChart.getChart();

      let [status, dataAll] = await callApiGet('latex');

      if (status == 200) {
        hideloader();

        let allTables = new Latex_All_Data(dataAll, newChart);
        allTables.createAll();
        let tableAllReady = allTables.getTable();
        let dataBox = document.createElement('div');
        dataBox.classList.add('dataBox');
        dataBox.appendChild(chart);
        dataBox.appendChild(tableAllReady);
        app.appendChild(dataBox);

        // NavOptions
        removeDbSettings();
      } else if (status != 200 && status != 403) {
        let alert = new Alerts(status, 'alert-red');
        alert.createNew();
        hideloader();
        app.appendChild(NoDataFound('Latex'));
      } else if (status == 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-orange');
        alert.createNew();
      } else if (statusRepl != 200) {
        let alert = new Alerts(statusRepl, 'alert-red');
        alert.createNew();
      }
    } catch (error) {
      console.log(error);
      let alert = new Alerts(error, error, 'alert-red');
      alert.createNew();
    }
  }
}
