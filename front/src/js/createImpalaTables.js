import { generateNewChart } from './common.js';
import {
  createThead,
  createTbody,
  descriptionsBox,
} from './common_components.js';

export class Impala_All_Data {
  constructor(data, chart) {
    this.data = data;
    this.chart = chart;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
    this.thead_elements = ['Unit', 'Printed\n[m2]', 'Ink\n[ml]', 'Date'];
  }

  createAll() {
    let theads = createThead(this.thead_elements);
    let actions_data = { chart: this.chart };
    let tbody = createTbody(this.data, 'impala', actions_data);
    let descriptions = {
      first: '*całkowity przebieg urządzeń',
    };
    let description = descriptionsBox(descriptions);
    this.table.appendChild(theads);
    this.table.appendChild(tbody);
    this.tableBox.appendChild(this.table);
    this.tableBox.appendChild(description);
  }

  getTables() {
    return this.tableBox;
  }
}

export class createFiltersReplacements {
  constructor(data) {
    this.data = data;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
    this.filters_thead_elements = [
      'Unit',
      'Black',
      'Cyan',
      'Magenta',
      'Yellow',
      'White',
    ];
  }

  createAll() {
    let thead = createThead(this.filters_thead_elements);
    let actions_data = {
      filters_threshold: this.data.filters_threshold,
    };
    let tbody = createTbody(this.data.units, 'impala_filters', actions_data);
    let descriptions = {
      first: '*ostatnia data wymiany oraz aktualny przebieg filtrów',
      second: `aktualny target [ml]: ${this.data.filters_threshold} ml`,
    };
    let description = descriptionsBox(descriptions);
    this.table.appendChild(thead);
    this.table.appendChild(tbody);
    this.tableBox.appendChild(this.table);
    this.tableBox.appendChild(description);
  }
  getTables() {
    return this.tableBox;
  }
}

export class createBearingsReplacements {
  constructor(data) {
    this.data = data;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
    this.bearings_thead_elements = ['Unit', 'Łożyska/Paski'];
  }

  createAll() {
    let thead = createThead(this.bearings_thead_elements);
    let actions_data = {
      bearings_threshold: this.data.bearings_threshold,
    };
    let tbody = createTbody(this.data.units, 'impala_bearings', actions_data);
    let descriptions = {
      first: '*ostatnia data wymiany oraz aktualny przebieg łożysk i pasków',
      second: `aktualny target [m2]: ${this.data.bearings_threshold} m2`,
    };
    let description = descriptionsBox(descriptions);
    this.table.appendChild(thead);
    this.table.appendChild(tbody);
    this.tableBox.appendChild(this.table);
    this.tableBox.appendChild(description);
  }

  getTables() {
    return this.tableBox;
  }
}

Object.defineProperty(String.prototype, 'capitalize', {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});
