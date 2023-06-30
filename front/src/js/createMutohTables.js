import { navigateTo } from './index.js';
import { callApiPut } from './endpoints.js';
import { Alerts } from './alerts/alerts.js';
import { generateNewChart, hideAllSnInputs } from './common.js';
import {
  createThead,
  pack_to_table,
  pack_to_scroll_table,
  createTbody,
  descriptionsBox,
} from './common_components.js';

export class createTablesMutoh {
  constructor(data, target, chart) {
    this.data = data;
    this.target = target;
    this.chart = chart;
    this.result = [];
    this.tableBox = document.createElement('div');
    this.tableBox.classList.add('tableBox');
    this.table = document.createElement('table');
    this.thead_elements = [
      'Unit',
      'S/N',
      'Printed\n[m2]',
      'Ink\n[ml]',
      'Date',
      'Target\n[%]',
    ];
  }

  createAll() {
    let theads = createThead(this.thead_elements);
    let theads_ready = pack_to_table(theads);

    let actions_data = { target: this.target, chart: this.chart };
    let tbody = createTbody(this.data.reverse(), 'mutoh', actions_data);
    let tbody_ready = pack_to_scroll_table(tbody);

    let descriptions = {
      first: '*całkowity przebieg urządzeń',
      second: `Aktualny target [m2]: ${this.target} m2`,
    };
    let description = descriptionsBox(descriptions);
    this.table.appendChild(theads_ready);
    this.table.appendChild(tbody_ready);
    this.tableBox.appendChild(this.table);
    this.tableBox.appendChild(description);
  }

  // createTbody() {
  //   let tbody = document.createElement('tbody');
  //   tbody.classList.add('tbody');
  //   let sortedData = this.data.reverse();
  //   sortedData.forEach((unit) => {
  //     let tr = document.createElement('tr');
  //     for (const [key, value] of Object.entries(unit)) {
  //       let each = document.createElement('td');
  //       each.classList.add('table-td');
  //       each.innerText = value;
  //       if (key == 'unit') {
  //         each.classList.add('unit');
  //         each.onclick = () => {
  //           let path = `mutoh/chart/${value}`;
  //           sessionStorage.setItem('activeChartData', path);
  //           sessionStorage.setItem('activeUnit', value);
  //           generateNewChart(this.chart);
  //         };
  //       } else if (key == 'date') {
  //         each.innerText = value.replace('T', ' ');
  //         let date = new Date();
  //         if (Date.parse(value) < date.setDate(date.getDate() - 7)) {
  //           tr.classList.add('unused');
  //         }
  //       } else if (key == 'suma_m2' && value >= this.target) {
  //         tr.classList.add('target-reached');
  //       } else if (key == 'target_reached') {
  //         each.innerText = '';
  //         each.classList.add('progress-bar-box');
  //         let [progressBarBox, progressLabel] = this.createProgressBar(value);
  //         each.appendChild(progressBarBox);
  //         each.appendChild(progressLabel);
  //       } else if (key == 'sn' && value == 'xx-xxx0000') {
  //         let unit_number = unit.unit.split(' ').pop();
  //         this.showSnInputText(each, unit_number);
  //       }
  //       tr.appendChild(each);
  //     }
  //     tbody.appendChild(tr);
  //   });
  //   return tbody;
  // }

  options() {
    let settingsBtnBox = document.createElement('div');
    settingsBtnBox.classList.add('settingsBtnBox');
    let settingsBtn = document.querySelector('.settingsBtn');
    settingsBtn.innerText = 'Zmień target';
    settingsBtn.onclick = () => {
      let changeTargetBox = document.querySelector('.settingsBox');
      if (changeTargetBox.style.visibility === 'hidden') {
        changeTargetBox.style.visibility = null;
        document.querySelector('.changeInput').focus();
      } else {
        changeTargetBox.style.visibility = 'hidden';
      }
    };
    settingsBtnBox.appendChild(settingsBtn);
    return settingsBtnBox;
  }

  changeTarget() {
    if (document.querySelector('.settingsBox')) {
      document.querySelector('.settingsBtnBox').remove();
      document.querySelector('.settingsBox').remove();
    }
    let settingsBox = document.createElement('div');
    settingsBox.classList.add('settingsBox');
    settingsBox.style.visibility = 'hidden';

    let changeLabel = document.createElement('p');
    changeLabel.innerText = 'Wprowadź nowy target [m2]:';
    let changeInputBox = document.createElement('div');
    changeInputBox.classList.add('changeInputBox');
    let form = document.createElement('form');
    form.classList.add('changeForm');
    let changeInput = document.createElement('input');
    changeInput.type = 'text';
    changeInput.classList.add('changeInput');
    changeInput.placeholder = 'wprowadź wartość...';
    let validNumberLabel = document.createElement('small');
    validNumberLabel.id = 'validNumberLabel';
    let submit = document.createElement('input');
    submit.classList.add('settingsBtn');
    submit.type = 'submit';
    submit.value = 'zapisz';
    form.onsubmit = async (event) => {
      event.preventDefault();
      let validate = this.numberValidation(changeInput.value);
      if (validate == true) {
        let [response, status] = await callApiPut(
          'mutoh/target/' + changeInput.value
        );
        console.log(status, response);
        if (status == 200) {
          navigateTo('/mutoh');
        } else {
          let alert = new Alerts(status, response.detail, 'alert-red');
          alert.createNew();
        }
      }
    };

    form.appendChild(changeLabel);
    changeInputBox.appendChild(changeInput);
    changeInputBox.appendChild(validNumberLabel);
    form.appendChild(changeInputBox);
    form.appendChild(submit);
    settingsBox.appendChild(form);

    return settingsBox;
  }

  numberValidation(number) {
    let input = document.querySelector('.changeInput');
    if (isNaN(number)) {
      document.querySelector('#validNumberLabel').innerText =
        'wprowadzona wartość nie jest cyfrą';
      input.classList.add('invalidNumber');
      return false;
    } else {
      document.querySelector('#validNumberLabel').innerText = '';
      input.classList.remove('invalidNumber');
      return true;
    }
  }

  // showSnInputText(each, unit_number) {
  //   const snOverlay = document.querySelector('.mask');
  //   each.innerText = '';
  //   let snDefaultBox = document.createElement('div');
  //   snDefaultBox.innerText = 'add s/n';
  //   snDefaultBox.classList.add('default-sn');
  //   let snFieldForm = document.createElement('form');
  //   snFieldForm.classList.add('snFieldForm');
  //   snFieldForm.style.display = 'none';
  //   snFieldForm.id = `sn_${unit_number}_Form`;
  //   let snField = document.createElement('input');
  //   snField.type = 'text';
  //   snField.classList.add('sn-changeInput');
  //   snField.id = `sn_${unit_number}`;
  //   snFieldForm.appendChild(snField);
  //   each.appendChild(snDefaultBox);
  //   each.appendChild(snFieldForm);

  //   each.onclick = () => {
  //     //hide all
  //     snOverlay.classList.add('mask-open');
  //     each.parentElement.classList.add('active-sn-edit');
  //     hideAllSnInputs();
  //     snDefaultBox.style.display = 'none';
  //     snFieldForm.style.display = null;
  //     snField.focus();
  //   };
  //   each.onsubmit = async (event) => {
  //     event.preventDefault();
  //     let newSN = document.querySelector(`#sn_${unit_number}`);
  //     let data = newSN.value;
  //     let validate = this.serialValidation(data);
  //     if (validate == true) {
  //       let [response, status] = await callApiPut(
  //         `mutoh/sn/Mutoh ${unit_number}/${data}`
  //       );
  //       console.log(status, response);
  //       hideAllSnInputs();
  //       snOverlay.classList.remove('mask-open');
  //       if (status == 200) {
  //         navigateTo('/mutoh');
  //       } else {
  //         let alert = new Alerts(status, response.detail, 'alert-red');
  //         alert.createNew();
  //       }
  //     }
  //   };
  // }

  serialValidation(sn) {
    //TODO tutaj musi być RegExp
    return true;
  }

  getTables() {
    // return this.result;
    return this.tableBox;
  }

  // createProgressBar(value) {
  //   let progressBarBox = document.createElement('div');
  //   progressBarBox.classList.add('progress-bar');
  //   let prograssBar = document.createElement('div');
  //   let progressLabel = document.createElement('small');
  //   progressLabel.classList.add('progress-label');
  //   progressLabel.innerText = value + '%';
  //   progressBarBox.appendChild(prograssBar);
  //   this.myTimer(prograssBar, value);
  //   return [progressBarBox, progressLabel];
  // }

  // myTimer(obj, value) {
  //   let progress = value;
  //   progress = Math.min(progress, 100);
  //   obj.style.width = progress + '%';
  // }
}
