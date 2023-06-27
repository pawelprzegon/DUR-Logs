import { generateNewChart } from './common.js';

export class Latex_All_Data {
  constructor(data, chart) {
    this.data = data;
    this.chart = chart;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
  }

  createAll() {
    let theads = this.createThead();
    let tbody = this.createTbody();
    let description = this.descriptionsBox();
    let table = document.createElement('table');
    table.appendChild(theads);
    table.appendChild(tbody);
    this.tableBox.appendChild(table);
    this.tableBox.appendChild(description);
  }

  createThead() {
    const heads = ['Unit', 'Printed\n[m2]', 'Ink\n[ml]', 'Date'];
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    heads.forEach((head) => {
      let each = document.createElement('th');
      each.classList.add('table-th');
      each.innerText = head;
      tr.appendChild(each);
      thead.appendChild(tr);
    });

    return thead;
  }

  createTbody() {
    let tbody = document.createElement('tbody');
    this.data.forEach((unit) => {
      let tr = document.createElement('tr');
      for (const [key, value] of Object.entries(unit)) {
        if (key != 'filters' && key != 'bearings') {
          let each = document.createElement('td');
          each.classList.add('table-td');
          each.innerText = value;
          if (key == 'unit') {
            each.classList.add('unit');
            each.onclick = () => {
              let path = `latex/chart/${value}`;
              localStorage.setItem('activeChartData', path);
              localStorage.setItem('activeUnit', value);
              generateNewChart(this.chart);
            };
          }
          tr.appendChild(each);
        }
      }
      tbody.appendChild(tr);
    });
    return tbody;
  }

  descriptionsBox() {
    let descBox = document.createElement('div');
    descBox.classList.add('descBox');
    let descLabel = document.createElement('small');
    descLabel.innerText = '*całkowity przebieg urządzeń';
    descBox.appendChild(descLabel);

    return descBox;
  }

  getTable() {
    return this.tableBox;
  }
}

// Object.defineProperty(String.prototype, 'capitalize', {
//   value: function () {
//     return this.charAt(0).toUpperCase() + this.slice(1);
//   },
//   enumerable: false,
// });
