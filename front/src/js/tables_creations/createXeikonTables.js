import { createThead } from './common_tables_components.js';
import { descriptionsBox, createTbody } from './common_tables_components.js';

export class Xeikon_All_Data {
  constructor(data, chart) {
    this.data = data;
    this.chart = chart;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
    this.thead_elements = [
      'Unit',
      'S/N',
      'Printed\n[A3]',
      'Ink\n[gram]',
      'date',
    ];
  }

  createAll() {
    let theads = createThead(this.thead_elements);
    let actions_data = { chart: this.chart };
    let tbody = createTbody(this.data, 'xeikon', actions_data);
    let descriptions = {
      first: '*całkowity przebieg urządzeń',
    };
    let description = descriptionsBox(descriptions);
    this.table.appendChild(theads);
    this.table.appendChild(tbody);
    this.tableBox.appendChild(this.table);
    this.tableBox.appendChild(description);
  }

  getTable() {
    return this.tableBox;
  }
}

export class Xeikon_Data {
  constructor(data, description, chart, dataPath) {
    this.data = data;
    this.description = { first: description };
    this.chart = chart;
    this.dataPath = dataPath;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
    this.thead_elements = Object.keys(this.data[0]);
  }

  createAll(choice) {
    let theads = createThead(this.thead_elements);
    let actions_data = { chart: this.chart, dataPath: this.dataPath };
    let tbody = createTbody(this.data, choice, actions_data);
    let description = descriptionsBox(this.description);
    let table = document.createElement('table');
    table.appendChild(theads);
    table.appendChild(tbody);
    this.tableBox.appendChild(table);
    this.tableBox.appendChild(description);
  }

  getTable() {
    return this.tableBox;
  }
}
