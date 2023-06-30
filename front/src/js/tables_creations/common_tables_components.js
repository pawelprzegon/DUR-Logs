import {
  impala_actions,
  impala_filters_actions,
  impala_bearings_actions,
} from '../tables_actions/impala_actions.js';
import { mutoh_actions } from '../tables_actions/mutoh_actions.js';
import { latex_actions } from '../tables_actions/latex_actions.js';
import {
  xeikon_actions,
  xeikon_action_single_data,
  xeikon_action_double_data,
} from '../tables_actions/xeikon_actions.js';

export function createThead(list_of_elements) {
  let thead = document.createElement('thead');
  thead.classList.add('thead');
  let tr = document.createElement('tr');
  list_of_elements.forEach((head) => {
    let each = document.createElement('th');
    each.classList.add('table-th');
    each.innerText = head.capitalize();
    tr.appendChild(each);
    thead.appendChild(tr);
  });
  return thead;
}

export function pack_to_table(thead) {
  let tableThead = document.createElement('table');
  tableThead.appendChild(thead);
  return tableThead;
}

export function pack_to_scroll_table(tbody) {
  let tableTbodyBox = document.createElement('div');
  tableTbodyBox.classList.add('tableTbodyBox');
  let tableTbody = document.createElement('table');
  tableTbody.appendChild(tbody);
  tableTbodyBox.appendChild(tableTbody);
  return tableTbodyBox;
}

export function createTbody(data, printer_type, actions_data) {
  let tbody = document.createElement('tbody');
  tbody.classList.add('tbody');
  data.forEach((unit) => {
    let tr = document.createElement('tr');
    for (const [key, value] of Object.entries(unit)) {
      let each = document.createElement('td');
      each.classList.add('table-td');
      each.innerText = value;
      if (printer_type === 'mutoh') {
        mutoh_actions(key, value, tr, each, unit, actions_data);
      } else if (printer_type === 'impala') {
        if (key == 'filters' || key == 'bearings') {
          break;
        }
        impala_actions(key, value, each, actions_data);
      } else if (printer_type === 'impala_filters' && key !== 'unit') {
        impala_filters_actions(key, value, each, unit.unit, actions_data);
      } else if (printer_type === 'impala_bearings') {
        if (key !== 'unit' && key !== 'last_replacement') {
          impala_bearings_actions(each, unit, actions_data);
        } else if (key === 'last_replacement') {
          break;
        }
      } else if (printer_type === 'latex') {
        latex_actions(key, value, each, actions_data);
      } else if (printer_type === 'xeikon') {
        xeikon_actions(key, value, each, actions_data);
      } else if (printer_type == 'single_data') {
        xeikon_action_single_data(key, value, each, actions_data);
      } else if (printer_type == 'double_data' && key !== 'unit') {
        xeikon_action_double_data(value, each, tr);
      }
      tr.appendChild(each);
    }
    tbody.appendChild(tr);
  });
  return tbody;
}

export function descriptionsBox(data) {
  let describBox = document.createElement('div');
  describBox.classList.add('descBox');
  Object.entries(data).forEach(([key, value]) => {
    let text_box = document.createElement('small');
    text_box.innerText = value;
    describBox.appendChild(text_box);
  });
  return describBox;
}
