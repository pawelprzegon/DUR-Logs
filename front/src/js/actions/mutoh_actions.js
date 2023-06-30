import { generateNewChart, hideAllSnInputs } from '../common.js';
import { Alerts } from '../alerts/alerts.js';
import { callApiPut } from '../endpoints.js';
import { navigateTo } from '../index.js';

export function mutoh_actions(key, value, tr, each, unit, actions_data) {
  if (key == 'unit') {
    each.classList.add('unit');
    each.onclick = () => {
      let path = `mutoh/chart/${value}`;
      sessionStorage.setItem('activeChartData', path);
      sessionStorage.setItem('activeUnit', value);
      generateNewChart(actions_data.chart);
    };
  } else if (key == 'date') {
    each.innerText = value.replace('T', ' ');
    let date = new Date();
    if (Date.parse(value) < date.setDate(date.getDate() - 7)) {
      tr.classList.add('unused');
    }
  } else if (key == 'suma_m2' && value >= actions_data.target) {
    tr.classList.add('target-reached');
  } else if (key == 'target_reached') {
    each.innerText = '';
    each.classList.add('progress-bar-box');
    let [progressBarBox, progressLabel] = createProgressBar(value);
    each.appendChild(progressBarBox);
    each.appendChild(progressLabel);
  } else if (key == 'sn' && value == 'xx-xxx0000') {
    let unit_number = unit.unit.split(' ').pop();
    showSnInputText(each, unit_number);
  }
}

function showSnInputText(each, unit_number) {
  const snOverlay = document.querySelector('.mask');
  each.innerText = '';
  let snDefaultBox = document.createElement('div');
  snDefaultBox.innerText = 'add s/n';
  snDefaultBox.classList.add('default-sn');
  let snFieldForm = document.createElement('form');
  snFieldForm.classList.add('snFieldForm');
  snFieldForm.style.display = 'none';
  snFieldForm.id = `sn_${unit_number}_Form`;
  let snField = document.createElement('input');
  snField.type = 'text';
  snField.classList.add('sn-changeInput');
  snField.id = `sn_${unit_number}`;
  snFieldForm.appendChild(snField);
  each.appendChild(snDefaultBox);
  each.appendChild(snFieldForm);

  each.onclick = () => {
    //hide all
    snOverlay.classList.add('mask-open');
    each.parentElement.classList.add('active-sn-edit');
    hideAllSnInputs();
    snDefaultBox.style.display = 'none';
    snFieldForm.style.display = null;
    snField.focus();
  };
  each.onsubmit = async (event) => {
    event.preventDefault();
    let newSN = document.querySelector(`#sn_${unit_number}`);
    let data = newSN.value;
    let validate = serialValidation(data);
    if (validate == true) {
      let [response, status] = await callApiPut(
        `mutoh/sn/Mutoh ${unit_number}/${data}`
      );
      console.log(status, response);
      hideAllSnInputs();
      snOverlay.classList.remove('mask-open');
      if (status == 200) {
        navigateTo('/mutoh');
      } else {
        let alert = new Alerts(status, response.detail, 'alert-red');
        alert.createNew();
      }
    }
  };
}

function serialValidation(sn) {
  //TODO tutaj musi być RegExp
  return true;
}

function createProgressBar(value) {
  let progressBarBox = document.createElement('div');
  progressBarBox.classList.add('progress-bar');
  let prograssBar = document.createElement('div');
  let progressLabel = document.createElement('small');
  progressLabel.classList.add('progress-label');
  progressLabel.innerText = value + '%';
  progressBarBox.appendChild(prograssBar);
  myTimer(prograssBar, value);
  return [progressBarBox, progressLabel];
}

function myTimer(obj, value) {
  let progress = value;
  progress = Math.min(progress, 100);
  obj.style.width = progress + '%';
}
