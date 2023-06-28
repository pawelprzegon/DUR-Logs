import {
  getTwoColors,
  getManyColors,
  uniqueSortedList,
  generateNewChart,
  onlyUnique,
} from '../common.js';

export class createChart {
  constructor() {
    this.myChart;
    this.path;
    this.lastUnit;
    this.chartArea = document.createElement('div');
    this.chartArea.classList.add('chart-area');
  }

  async getData() {
    this.period = [
      { name: 'msc 1' },
      { name: 'msc 3' },
      { name: 'msc 6' },
      { name: 'msc 12' },
      { name: 'msc all' },
    ];

    this.chartArea.appendChild(this.createChartCanvas());
    this.dropDownBox = document.createElement('div');
    this.dropDownBox.classList.add('dropDown-Box');
    this.dropDownBox.appendChild(this.createDropDownList());
    this.chartArea.appendChild(this.dropDownBox);
  }

  createChartCanvas() {
    const ChartsArea = document.createElement('div');
    ChartsArea.classList.add('chart');
    const canvas = document.createElement('canvas');
    canvas.id = 'charts';
    canvas.style = 'null';
    ChartsArea.appendChild(canvas);
    return ChartsArea;
  }

  createDropDownList() {
    let label = 'Okres';
    let dropdown = document.createElement('div');
    dropdown.classList.add('select-menu');
    dropdown.id = label;
    let lbl = document.createElement('p');
    lbl.classList.add('dropdown-label');
    lbl.innerText = label + ' [msc]';
    let btn = document.createElement('div');
    btn.classList.add('select-btn');
    let btnText = document.createElement('span');
    btnText.classList.add('sBtn-text');
    btnText.id = 'sBtn-text-' + label;
    btnText.innerText = '-';
    btn.appendChild(btnText);
    dropdown.appendChild(lbl);
    dropdown.appendChild(btn);

    // aktywny dropdown
    btn.onclick = () => {
      document.querySelector('#Okres').classList.toggle('active');
    };

    let okresList = document.createElement('ul');
    okresList.classList.add('options');
    let periods = uniqueSortedList(this.period, label);
    periods.forEach((element) => {
      let period = document.createElement('li');
      period.classList.add('option');
      period.innerText = element.split(' ')[1];
      period.onclick = () => {
        btnText.innerText = period.innerText;
        document.querySelector('#Okres').classList.remove('active');
        if (
          'activeChartData' in sessionStorage ||
          'activeUnit' in sessionStorage
        ) {
          generateNewChart(this);
        }
      };
      okresList.appendChild(period);
    });

    dropdown.appendChild(okresList);
    return dropdown;
  }

  createChart(unit, data) {
    if (this.myChart != undefined) {
      this.myChart.destroy();
    }

    let [labels, label, dataset, values] = prepareChartData(unit, data);
    let ctx = document.getElementById('charts').getContext('2d');
    let readyDataSet = [];
    let size = Object.keys(dataset).length;
    for (const [index, [key, value]] of Object.entries(
      Object.entries(dataset)
    )) {
      let color;
      if (size <= 2) {
        color = getTwoColors(ctx);
      } else {
        color = getManyColors(ctx);
      }
      data = {
        label: label[key],
        data: value,
        tension: 0.2,
        borderWidth: 2,
        backgroundColor: color[index][0],
        pointBackgroundColor: 'white',
        borderColor: color[index][1],
        fill: true,
      };
      readyDataSet.push(data);
    }

    this.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels['month'],
        datasets: readyDataSet,
      },
      options: {
        maintainAspectRatio: 2,
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: unit,
            padding: {
              top: 10,
              bottom: 20,
            },
            font: {
              weight: 'bold',
              size: 16,
            },
          },
          tooltip: {
            mode: 'index',
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: values,
            },
            min: 0,
            // max: max,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  getChart() {
    return this.chartArea;
  }
}

function reduceDate(date) {
  let tmpLbl = date.split('-');
  tmpLbl.pop();
  return tmpLbl.join('-');
}

function prepareChartData(unit, data) {
  let legend = new chartLegend();

  data.forEach((element) => {
    legend.addToMonths(element.date);
    for (const [key, value] of Object.entries(element)) {
      let letter = Array.from(unit)[0];
      if (letter == 'I' || letter == 'M' || letter == 'L') {
        if (key == 'printed') {
          legend.addToLabel(key);
          legend.addToValues('[m2]');
        } else if (key == 'ink') {
          legend.addToLabel(key);
          legend.addToValues('[ml]');
        }
      } else if (letter == 'X') {
        if (key == 'printed') {
          legend.addToLabel(key);
          legend.addToValues('[A3]');
          legend.addToUnits('[A3]');
        } else if (key == 'date' || key == 'unit') {
        } else {
          legend.addToLabel(key);
          legend.addToValues('[gram]');
          legend.addToUnits('[gram]');
        }
      }
      if (key != 'date' && key != 'unit') {
        legend.addToDataSet(key, value);
      }
    }
  });
  return [
    legend.getLabels(),
    legend.getLabel(),
    legend.getdataSet(),
    legend.getValues(),
  ];
}

class chartLegend {
  constructor() {
    this.dataset = {};
    this.labels = {};
    this.label = {};
    this.values = [];
  }

  addToUnits(element) {
    if (this.labels['mesurment_units']) {
      this.labels['mesurment_units'].push(element);
    } else {
      this.labels['mesurment_units'] = [element];
    }
  }

  addToMonths(element) {
    let splitedDate = element.split('-');
    let shortDate = splitedDate[0] + '-' + splitedDate[1];
    if (this.labels['month']) {
      this.labels['month'].push(shortDate);
    } else {
      this.labels['month'] = [shortDate];
    }
  }

  addToDataSet(key, element) {
    if (this.dataset[key]) {
      this.dataset[key].push(element);
    } else {
      this.dataset[key] = [element];
    }
  }

  addToLabel(element) {
    this.label[element] = element;
  }

  addToValues(element) {
    this.values.push(element);
  }

  getLabels() {
    return this.labels;
  }
  getdataSet() {
    return this.dataset;
  }
  getLabel() {
    return this.label;
  }
  getValues() {
    this.values = this.values.filter(onlyUnique);
    return this.values;
  }
}
