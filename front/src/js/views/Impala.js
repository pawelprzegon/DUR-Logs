import AbstractView from './AbstractView.js';
import { callApiGet } from '../common_functions/endpoints.js';
import {
  Impala_All_Data,
  createFiltersReplacements,
  createBearingsReplacements,
} from '../tables_creations/createImpalaTables.js';
import { createChart } from '../chart/createChart.js';
import { Alerts } from '../alerts/alerts.js';
import {
  Replacement,
  hideloader,
  removeDbSettings,
  showloader,
  NoDataFound,
} from '../common_functions/common.js';

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle('Impala');
  }

  async getData() {
    document.querySelector('#app').innerHTML = '';
    try {
      showloader();
      let app = document.querySelector('#app');
      let newChart = new createChart();
      newChart.getData();
      let chart = newChart.getChart();

      let [status, dataAll] = await callApiGet('impala');
      let [statusReplFilters, dataReplFilters] = await callApiGet(
        'impala/replacements/filters'
      );
      let [statusReplBearings, dataReplBearings] = await callApiGet(
        'impala/replacements/bearings'
      );
      if (
        status == 200 &&
        statusReplFilters == 200 &&
        statusReplBearings == 200
      ) {
        hideloader();

        let tables = new Impala_All_Data(dataAll, newChart);
        tables.createAll();
        let tableAllReady = tables.getTables();
        let dataBox = document.createElement('div');
        dataBox.classList.add('dataBox');
        dataBox.appendChild(chart);
        dataBox.appendChild(tableAllReady);
        app.appendChild(dataBox);

        let tableFiltersReplacements = new createFiltersReplacements(
          dataReplFilters
        );
        tableFiltersReplacements.createAll();
        let tableFiltersReplacementsReady =
          tableFiltersReplacements.getTables();

        let tableBearingsReplacements = new createBearingsReplacements(
          dataReplBearings
        );
        tableBearingsReplacements.createAll();
        let tableBearingsReplacementsReady =
          tableBearingsReplacements.getTables();

        let dataBox_Repl = document.createElement('div');
        dataBox_Repl.classList.add('dataBox');
        dataBox_Repl.appendChild(tableFiltersReplacementsReady);
        dataBox_Repl.appendChild(tableBearingsReplacementsReady);
        app.appendChild(dataBox_Repl);

        // NavOptions
        let navOptions = document.querySelector('#opcje');

        removeDbSettings();
        // filters and bearings replacements
        let partsDesc = 'Wprowadź datę oraz zaznacz pozycję w tabeli:';
        let partsLbl = 'Wprowadź wymianę';
        let partsPlchold = 'data';
        let partsPath = '/impala';
        let partsRepl = new Replacement(
          partsDesc,
          partsLbl,
          partsPlchold,
          partsPath
        );
        partsRepl.createBox();
        partsRepl.callendarReplacement();
        navOptions.appendChild(partsRepl.getReplaceBox());

        // change targets for filters
        let fTargetDesc = 'Wprowadź nowy target [ml]:';
        let fTargetLbl = 'Zmień target dla filtrów';
        let fTargetPlchold = 'wartość';
        let fTargetPath = '/impala';
        let fTarget = new Replacement(
          fTargetDesc,
          fTargetLbl,
          fTargetPlchold,
          fTargetPath
        );
        fTarget.createBox();
        fTarget.inputValue('impala/settings/filters&');
        navOptions.appendChild(fTarget.getReplaceBox());

        // change targets for bearings
        let bTargetDesc = 'Wprowadź nowy target [m2]:';
        let bTargetLbl = 'Zmień target dla łożysk';
        let bTargetPlchold = 'wartość';
        let bTargetPath = '/impala';
        let bTarget = new Replacement(
          bTargetDesc,
          bTargetLbl,
          bTargetPlchold,
          bTargetPath
        );
        bTarget.createBox();
        bTarget.inputValue('impala/settings/bearings&');
        navOptions.appendChild(bTarget.getReplaceBox());
      } else if (status != 200 && status != 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-red');
        alert.createNew();
        hideloader();
        app.appendChild(NoDataFound('Impala'));
      } else if (status == 403) {
        let alert = new Alerts(status, dataAll.detail, 'alert-orange');
        alert.createNew();
      } else if (statusReplFilters != 200) {
        let alert = new Alerts(
          statusReplFilters,
          dataReplFilters.detail,
          'alert-red'
        );
        alert.createNew();
      } else if (statusReplBearings != 200) {
        let alert = new Alerts(
          statusReplBearings,
          dataReplBearings.detail,
          'alert-red'
        );
        alert.createNew();
      }
    } catch (error) {
      console.log(error);
      let alert = new Alerts(error, error, 'alert-red');
      alert.createNew();
    }
  }
}
