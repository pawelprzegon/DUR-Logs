import {
  generateNewChart,
  setSessionStorageItems,
} from '../common_functions/common.js';

export function xeikon_actions(key, value, each, actions_data) {
  if (key == 'unit') {
    each.classList.add('unit');
    each.onclick = () => {
      let path = `xeikon/chart/${value}`;
      setSessionStorageItems(path, value);
      generateNewChart(actions_data.chart);
    };
  }
}

export function xeikon_action_single_data(key, value, each, actions_data) {
  if (key == 'unit' && actions_data.dataPath != undefined) {
    each.classList.add('unit');
    each.onclick = () => {
      let path = actions_data.dataPath + `chart/${value}`;
      setSessionStorageItems(path, value);
      generateNewChart(actions_data.chart);
    };
  }
}

export function xeikon_action_double_data(value, each) {
  each.innerText = '';
  let each_ = document.createElement('td');
  each_.classList.add('table-td');
  let current = document.createElement('p');
  current.innerText = value.current;
  let replace = document.createElement('p');
  replace.innerText = value.replaced;
  each_.appendChild(current);
  each_.appendChild(replace);
  each.appendChild(each_);
}
