import { mutoh_actions } from './mutoh_actions.js';

export function createThead(list_of_elements) {
  let thead = document.createElement('thead');
  thead.classList.add('thead');
  let tr = document.createElement('tr');
  list_of_elements.forEach((head) => {
    let each = document.createElement('th');
    each.classList.add('table-th');
    each.innerText = head;
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
