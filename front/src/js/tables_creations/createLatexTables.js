import {
  createThead,
  createTbody,
  descriptionsBox,
} from './common_tables_components.js';

export class createTablesLatex {
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
    let tbody = createTbody(this.data, 'latex', actions_data);

    let descriptions = {
      first: '*całkowity przebieg urządzeń',
    };
    let description = descriptionsBox(descriptions);
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
