import { navigateTo } from '../index.js';
import { callApiPut } from '../common_functions/endpoints.js';
import { Alerts } from '../alerts/alerts.js';
import {
  createThead,
  pack_to_table,
  pack_to_scroll_table,
  createTbody,
  descriptionsBox,
} from './common_tables_components.js';

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

  getTables() {
    // return this.result;
    return this.tableBox;
  }
}
