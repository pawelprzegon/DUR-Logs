import AbstractView from './AbstractView.js';
import { callApiGet } from '../common_functions/endpoints.js';
import { createTablesMutoh } from '../tables_creations/createMutohTables.js';
import { createChart } from '../chart/createChart.js';
import { Alerts } from '../alerts/alerts.js';
import {
  Replacement,
  hideloader,
  removeDbSettings,
  showloader,
  NoDataFound,
  hideOverlayForSn,
} from '../common_functions/common.js';

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle('Mutoh');
  }

  async getData() {
    document.querySelector('#app').innerHTML = '';
    try {
      showloader();
      let [status, dataAll] = await callApiGet('mutoh');
      let [statusTarget, target] = await callApiGet('mutoh/target');
      if (status == 200 && statusTarget == 200) {
        hideloader();
        dataAll.sort(dynamicSort('-name'));
        const container = document.querySelector('.container');
        const overlay = document.createElement('div');
        overlay.classList.add('mask');
        container.appendChild(overlay);

        let app = document.querySelector('#app');
        let newChart = new createChart();
        newChart.getData();
        let chart = newChart.getChart();
        let tables = new createTablesMutoh(dataAll, target.target, newChart);
        // tables.createTables();
        tables.createAll();
        let table = tables.getTables();
        let dataBox = document.createElement('div');
        dataBox.classList.add('dataBox');
        dataBox.appendChild(chart);
        dataBox.appendChild(table);
        app.appendChild(dataBox);

        // NavOptions
        removeDbSettings();
        let navOptions = document.querySelector('#opcje');

        let desc = 'Wprowadź nowy target [m2]:';
        let lbl = 'Zmień target';
        let plchold = 'wartość';
        let path = '/mutoh';
        let optionsData = new Replacement(desc, lbl, plchold, path);
        optionsData.createBox();
        optionsData.inputValue('mutoh/target/');
        navOptions.appendChild(optionsData.getReplaceBox());
        hideOverlayForSn();
      } else if (status != 200 && status != 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-red');
        alert.createNew();
        hideloader();
        app.appendChild(NoDataFound('Mutoh'));
      } else if (status == 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-orange');
        alert.createNew();
      } else if (statusTarget != 200) {
        hideloader();
        let alert = new Alerts(status, target.detail, 'alert-red');
        alert.createNew();
      }
    } catch (error) {
      console.log(error);
      let alert = new Alerts(error, error, 'alert-red');
      alert.createNew();
    }
  }
}

function dynamicSort(property) {
  let prop;
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    prop = property.substr(1);
  }
  return function (a, b) {
    let result = a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0;
    return result * sortOrder;
  };
}
