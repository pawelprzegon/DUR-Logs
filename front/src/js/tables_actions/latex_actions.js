import { generateNewChart } from '../common_functions/common.js';

export function latex_actions(key, value, each, actions_data) {
  if (key == 'unit') {
    each.classList.add('unit');
    each.onclick = () => {
      let path = `latex/chart/${value}`;
      sessionStorage.setItem('activeChartData', path);
      sessionStorage.setItem('activeUnit', value);
      generateNewChart(actions_data.chart);
    };
  }
}
