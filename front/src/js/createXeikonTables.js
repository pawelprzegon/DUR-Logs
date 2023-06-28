import { generateNewChart } from './common.js';

export class Xeikon_All_Data {
  constructor(data, description, chart) {
    this.data = data;
    this.description = description;
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
    const heads = ['Unit', 'S/N', 'Printed\n[A3]', 'Ink\n[gram]', 'date'];
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
    let suma = 0;
    let tbody = document.createElement('tbody');
    this.data.forEach((unit) => {
      let tr = document.createElement('tr');
      for (const [key, value] of Object.entries(unit)) {
        let each = document.createElement('td');
        each.classList.add('table-td');
        each.innerText = value;
        if (key == 'unit') {
          each.classList.add('unit');
          each.onclick = () => {
            let path = `xeikon/chart/${value}`;
            sessionStorage.setItem('activeChartData', path);
            sessionStorage.setItem('activeUnit', value);
            generateNewChart(this.chart);
          };
        }
        tr.appendChild(each);
      }
      tbody.appendChild(tr);
    });
    return tbody;
  }

  descriptionsBox() {
    let descBox = document.createElement('div');
    descBox.classList.add('descBox');
    let descLabel = document.createElement('small');
    descLabel.innerText = this.description;
    descBox.appendChild(descLabel);

    return descBox;
  }

  getTable() {
    return this.tableBox;
  }
}

export class Xeikon_Data {
  constructor(data, description, chart, dataPath) {
    this.data = data;
    this.description = description;
    this.chart = chart;
    this.dataPath = dataPath;
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
  }

  createAll(option) {
    let theads = this.createThead();
    let tbody;
    if (option == 1) {
      tbody = this.createTbody();
    }
    if (option == 2) {
      tbody = this.createTbody_Double();
    }
    let description = this.descriptionsBox();
    let table = document.createElement('table');
    table.appendChild(theads);
    table.appendChild(tbody);
    this.tableBox.appendChild(table);
    this.tableBox.appendChild(description);
  }

  createThead() {
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let each = document.createElement('th');
    each.classList.add('table-th');
    each.innerText = 'Nazwa';
    tr.appendChild(each);
    thead.appendChild(tr);
    for (const value of Object.values(this.data)) {
      for (const key of Object.keys(value)) {
        if (key != 'unit') {
          let each = document.createElement('th');
          each.classList.add('table-th');
          each.innerText = key;
          tr.appendChild(each);
          thead.appendChild(tr);
        }
      }
      break;
    }

    return thead;
  }

  createTbody() {
    let suma = 0;
    let tbody = document.createElement('tbody');
    this.data.forEach((unit) => {
      let tr = document.createElement('tr');
      for (const [key, value] of Object.entries(unit)) {
        let each = document.createElement('td');
        each.classList.add('table-td');
        each.innerText = value;
        if (key == 'unit' && this.dataPath != undefined) {
          each.classList.add('unit');
          each.onclick = () => {
            let path = this.dataPath + `chart/${value}`;
            sessionStorage.setItem('activeChartData', path);
            sessionStorage.setItem('activeUnit', value);
            generateNewChart(this.chart);
          };
        }
        tr.appendChild(each);
      }
      tbody.appendChild(tr);
    });
    return tbody;
  }

  createTbody_Double() {
    let suma = 0;
    let tbody = document.createElement('tbody');
    this.data.forEach((unit) => {
      let tr = document.createElement('tr');
      for (const [key, value] of Object.entries(unit)) {
        if (key == 'unit') {
          let each = document.createElement('td');
          each.classList.add('table-td');
          each.innerText = value;
          tr.appendChild(each);
        } else if (key != 'unit') {
          let each = document.createElement('td');
          each.classList.add('table-td');
          let current = document.createElement('p');
          current.innerText = value.current;
          let replace = document.createElement('p');
          replace.innerText = value.replaced;
          each.append(current);
          each.append(replace);
          tr.appendChild(each);
        }

        // if(key == 'unit'){
        //     each.classList.add('unit');
        //     each.onclick = () => {
        //         let unit = document.querySelector(`#unit${value.split(' ')[1]}`);
        //         unit.click();
        //     }}
      }
      tbody.appendChild(tr);
    });
    return tbody;
  }

  descriptionsBox() {
    let descBox = document.createElement('div');
    descBox.classList.add('descBox');
    let descLabel = document.createElement('small');
    descLabel.innerText = this.description;
    descBox.appendChild(descLabel);

    return descBox;
  }

  getTable() {
    return this.tableBox;
  }
}
