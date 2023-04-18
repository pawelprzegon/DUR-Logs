import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { createTablesMutoh } from "../createMutohTables.js";
import { createChart } from "../chart/createChart.js";



export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Mutoh");
    }

    async getData(){
        document.getElementById('app').innerHTML = ''

        let [status, data] = await callApiGet('mutohs/all');
        let [statusTarget, target] = await callApiGet('mutohs/target')
        data.sort(dynamicSort("-name"));
        let app = document.querySelector('#app');
        let newChart = new createChart('Mutoh');
        newChart.getData();
        let chart = newChart.getChart();
        let tables = new createTablesMutoh(data,target.target);
        tables.createTables();
        let descripts = tables.descriptions();
        let [tables_] = tables.getTables();
        app.appendChild(chart);
        app.appendChild(tables_);
        app.appendChild(descripts);
    }


    
}

function dynamicSort(property) {
    let sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {

        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
  
