import AbstractView from './AbstractView.js';
import { callApiGet } from '../common_functions/endpoints.js';
import {
  Xeikon_All_Data,
  Xeikon_Data,
} from '../tables_creations/createXeikonTables.js';
import { createChart } from '../chart/createChart.js';
import { Alerts } from '../alerts/alerts.js';
import {
  hideloader,
  showloader,
  removeDbSettings,
  NoDataFound,
} from '../common_functions/common.js';

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle('Xeikon');
  }

  async getData() {
    document.querySelector('#app').innerHTML = '';
    try {
      removeDbSettings();
      showloader();
      let app = document.querySelector('#app');
      let newChart = new createChart();
      newChart.getData();
      let chart = newChart.getChart();

      let [status, dataAll] = await callApiGet('xeikon');
      if (status == 200) {
        hideloader();
        let allTables = new Xeikon_All_Data(dataAll, newChart);
        allTables.createAll();
        let tableAllReady = allTables.getTable();

        let dataBox = document.createElement('div');
        dataBox.classList.add('dataBox');
        dataBox.appendChild(chart);
        dataBox.appendChild(tableAllReady);
        app.appendChild(dataBox);
      } else if (status != 200 && status != 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-red');
        alert.createNew();
        hideloader();
        app.appendChild(NoDataFound('Xeikon'));
      } else if (status == 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-orange');
        alert.createNew();
      }

      let tonerPath = 'xeikon/toner/';
      let dvlPath = 'xeikon/dvl/';
      let [statusToner, dataToner] = await callApiGet(tonerPath);
      let [statusDVL, dataDVL] = await callApiGet(dvlPath);
      if (statusToner == 200 && statusDVL == 200) {
        hideloader();
        let descriptionToner =
          '*całkowite zużycie tonera dla poszczególnych kolorów [gram]';
        let tonerTable = new Xeikon_Data(
          dataToner,
          descriptionToner,
          newChart,
          tonerPath
        );
        tonerTable.createAll('single_data');
        let tonerTableReady = tonerTable.getTable();

        let description = '*licznik DVL [A3] oraz ilość wymian [szt]';
        let dvlTable = new Xeikon_Data(dataDVL, description, newChart);
        dvlTable.createAll('double_data');
        let dvlTableReady = dvlTable.getTable();

        let DataBox = document.createElement('div');
        DataBox.classList.add('dataBox');
        DataBox.appendChild(tonerTableReady);
        DataBox.appendChild(dvlTableReady);
        app.appendChild(DataBox);
      } else if (statusDVL != 200 && statusDVL != 403) {
        let alert = new Alerts(statusDVL, dataDVL.detail, 'alert-red');
        alert.createNew();
      } else if (statusDVL == 403) {
        let alert = new Alerts(statusDVL, dataDVL.detail, 'alert-orange');
        alert.createNew();
      } else if (statusToner != 200) {
        let alert = new Alerts(statusToner, dataToner.detail, 'alert-red');
        alert.createNew();
      }

      let fuserPath = 'xeikon/fuser/';
      let clicksPath = 'xeikon/clicks/';
      let [statusFuser, dataFuser] = await callApiGet(fuserPath);
      let [statusClicks, dataClicks] = await callApiGet(clicksPath);
      if (statusFuser == 200 && statusClicks == 200) {
        hideloader();
        let descriptionFuser =
          '*aktualne zużycie fusera [A3] oraz ilość wymian [szt]';
        let fuserTable = new Xeikon_Data(dataFuser, descriptionFuser, newChart);
        fuserTable.createAll('single_data');
        let fuserTableReady = fuserTable.getTable();

        let descriptionClicks = '*aktualna ilość druku w kolorze oraz b&w [A3]';
        let clicksTable = new Xeikon_Data(
          dataClicks,
          descriptionClicks,
          newChart,
          clicksPath
        );
        clicksTable.createAll('single_data');
        let clicksTableReady = clicksTable.getTable();

        let dataBox = document.createElement('div');
        dataBox.classList.add('dataBox');
        dataBox.appendChild(fuserTableReady);
        dataBox.appendChild(clicksTableReady);
        app.appendChild(dataBox);
      } else if (statusFuser != 200 && statusFuser != 403) {
        let alert = new Alerts(statusFuser, dataFuser.detail, 'alert-red');
        alert.createNew();
      } else if (statusFuser == 403) {
        let alert = new Alerts(statusFuser, dataFuser.detail, 'alert-orange');
        alert.createNew();
      } else if (statusClicks != 200) {
        let alert = new Alerts(statusClicks, dataClicks.detail, 'alert-red');
        alert.createNew();
      } else if (statusClicks == 403) {
        let alert = new Alerts(statusClicks, dataClicks.detail, 'alert-red');
        alert.createNew();
      }
    } catch (error) {
      console.log(error);
      let alert = new Alerts(error, error, 'alert-red');
      alert.createNew();
    }
  }
}
