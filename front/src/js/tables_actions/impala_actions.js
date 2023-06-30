import {
  generateNewChart,
  setSessionStorageItems,
} from '../common_functions/common.js';

export function impala_actions(key, value, each, actions_data) {
  if (key == 'unit') {
    each.classList.add('unit');
    each.onclick = () => {
      let path = `impala/chart/${value}`;
      setSessionStorageItems(path, value);
      generateNewChart(actions_data.chart);
    };
  }
}

export function impala_filters_actions(key, val, each, unit, actions_data) {
  each.innerText = '';
  each.classList.add('clickable');
  let date = document.createElement('p');
  date.classList.add('replacement-date');
  let quantity = document.createElement('p');
  if (val['last_replacement'] != 'NaT') {
    each.id = `filters-${unit.split(' ')[1]}-${key}`;
    each.onclick = () => {
      if (each.classList.contains('activ')) {
        let selected = document.querySelector('.selected-to-replace');
        if (selected) {
          selected.classList.remove('selected-to-replace');
        }
        each.classList.add('selected-to-replace');
      }
    };
    if (val['liter'] * 1000 >= actions_data.filters_threshold) {
      each.classList.add('warning');
    }
    date.innerText = val['last_replacement'];
    quantity.innerText = val['liter'];
  } else {
    date.innerText = 0;
    quantity.innerText = 0;
  }
  each.appendChild(date);
  each.appendChild(quantity);
}

export function impala_bearings_actions(each, unit, actions_data) {
  each.classList.add('clickable');
  each.innerText = '';
  each.id = `bearings-${unit.unit.split(' ')[1]}`;
  each.onclick = () => {
    if (each.classList.contains('activ')) {
      let selected = document.querySelector('.selected-to-replace');
      if (selected) {
        selected.classList.remove('selected-to-replace');
      }
      each.classList.add('selected-to-replace');
    }
  };
  if (unit.tys_m2 * 1000 >= actions_data.bearings_threshold) {
    each.classList.add('warning');
  }
  let date = document.createElement('p');
  date.classList.add('replacement-date');
  date.innerText = unit.last_replacement;
  let quantity = document.createElement('p');
  quantity.innerText = unit.tys_m2;
  each.appendChild(date);
  each.appendChild(quantity);
}
