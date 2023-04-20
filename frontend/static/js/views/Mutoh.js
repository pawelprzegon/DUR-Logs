import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { createTablesMutoh } from "../createMutohTables.js";
import { createChart } from "../chart/createChart.js";
import { alerts } from "../alerts/alerts.js";



export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Mutoh");
    }

    async getData(){
        document.querySelector('#app').innerHTML = ''
        try{
            let [status, data] = await callApiGet('mutohs/all');
            let [statusTarget, target] = await callApiGet('mutohs/target');

            if (status == 200 && statusTarget == 200) {
                            data.sort(dynamicSort("-name"));
                            let app = document.querySelector('#app');
                            
                            let newChart = new createChart('Mutoh');
                            newChart.getData();
                            let chart = newChart.getChart();
                            let tables = new createTablesMutoh(data,target.target);
                            tables.createTables();
                            let [tables_] = tables.getTables();
                            let dataBox = document.createElement('div');
                            dataBox.classList.add('dataBox');
                            dataBox.appendChild(chart);
                            dataBox.appendChild(tables_);
                            app.appendChild(dataBox);
                
                            // NavOptions
                            let optionsData = new createTablesMutoh(data,target.target);
                            let navOptions = document.querySelector('#opcje');
                            let options = optionsData.options();
                            let optionsTarget = optionsData.changeTarget();
                            navOptions.appendChild(options);
                            navOptions.appendChild(optionsTarget);
                        }
            else if (status != 200) {
                                alerts(status, data.detail, 'alert-red');
                            }
            else if(statusTarget != 200){
                                alerts(status, target.detail, 'alert-red');
                            }

        }catch(error){
            alerts('error', error, 'alert-red');
        }
        
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
  
