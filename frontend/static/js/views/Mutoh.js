import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { createTablesMutoh } from "../createMutohTables.js";
import { createChart } from "../chart/createChart.js";
import { alerts } from "../alerts/alerts.js";
import { Replacement, hideloader, removeDbSettings, showloader } from "../common.js";



export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Mutoh");
    }

    async getData(){
        document.querySelector('#app').innerHTML = ''
        try{
            showloader();
            let [status, dataAll] = await callApiGet('mutoh');
            let [statusTarget, target] = await callApiGet('mutoh/target');

            if (status == 200 && statusTarget == 200) {
                            hideloader();
                            dataAll.sort(dynamicSort("-name"));
                            let app = document.querySelector('#app');
                            
                            let newChart = new createChart(dataAll, 'Mutoh');
                            newChart.getData();
                            let chart = newChart.getChart();
                            let tables = new createTablesMutoh(dataAll, target.target);
                            tables.createTables();
                            let [tables_] = tables.getTables();
                            let dataBox = document.createElement('div');
                            dataBox.classList.add('dataBox');
                            dataBox.appendChild(chart);
                            dataBox.appendChild(tables_);
                            app.appendChild(dataBox);
                
                            // NavOptions
                            removeDbSettings();
                            let navOptions = document.querySelector('#opcje');

                            let desc = 'Wprowadź nowy target [m2]:'
                            let lbl = 'Zmień target'
                            let plchold = 'wartość'
                            let path = '/mutoh'
                            let optionsData = new Replacement(desc, lbl, plchold, path);
                            optionsData.createBox();
                            optionsData.inputValue('mutoh/target/');
                            navOptions.appendChild(optionsData.getReplaceBox());
                            

                                
                           
                            
                        }
            else if (status != 200) {
                                alerts(status, dataAll.detail, 'alert-red');
                            }
            else if(statusTarget != 200){
                                alerts(status, target.detail, 'alert-red');
                            }

        }catch(error){
            console.log(error)
            alerts('error', error, 'alert-red');
        }
        
    }
}

function dynamicSort(property) {
    let prop
    let sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        prop = property.substr(1);
    }
    return function (a,b) {

        let result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
        return result * sortOrder;
    }
}
  
