import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { createTablesMutoh } from "../createMutohTables.js";
import { createChart } from "../chart/createChart.js";
import { alerts } from "../alerts/alerts.js";
import { Replacement, hideloader, showloader } from "../common.js";



export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Mutoh");
    }

    async getData(){
        document.querySelector('#app').innerHTML = ''
        try{
            showloader();
            let [status, data] = await callApiGet('mutohs/all');
            let [statusTarget, target] = await callApiGet('mutohs/target');

            if (status == 200 && statusTarget == 200) {
                            hideloader();
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
                            let navOptions = document.querySelector('#opcje');

                            if (document.querySelector('.DbSettings')){
                                document.querySelector('.DbSettings').remove();
                            }
                            
                            let desc = 'Wprowadź nowy target [m2]:'
                            let lbl = 'Zmień target'
                            let plchold = 'wartość'
                            let path = '/mutoh'
                            let optionsData = new Replacement(desc, lbl, plchold, path);
                            optionsData.createBox();
                            optionsData.inputValue('mutohs/target/');
                            navOptions.appendChild(optionsData.getReplaceBox());
                            
                        }
            else if (status != 200) {
                                alerts(status, data.detail, 'alert-red');
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
  
