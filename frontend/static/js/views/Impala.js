import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import {createTableAllImpala, createTableReplacementsImpala} from '../createImpalaTables.js'
import { createChart } from "../chart/createChart.js";
import { alerts } from "../alerts/alerts.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Impala");
    }

    async getData(){
        document.querySelector('#app').innerHTML = ''
        try{
            let [status, dataAll] = await callApiGet('impalas/all');
            let [statusRepl, dataReplacements] = await callApiGet('impalas/replacements/');
            if (status == 200 && statusRepl == 200) {
                            let app = document.querySelector('#app');
                            
                            let newChart = new createChart('Impala');
                            newChart.getData();
                            let chart = newChart.getChart();
                            let allTables = new createTableAllImpala(dataAll);
                            allTables.createTableAll();
                            let tableAllReady = allTables.getTable();
                            let dataBox = document.createElement('div')
                            dataBox.classList.add('dataBox')
                            dataBox.appendChild(chart)
                            dataBox.appendChild(tableAllReady);
                            app.appendChild(dataBox); 
                        
                            let tableFiltersReplacements = new createTableReplacementsImpala(dataReplacements);
                            tableFiltersReplacements.createTableAll('filters')
                            let tableFiltersReplacementsReady = tableFiltersReplacements.getTable();
                            
            
                            let tableBearingsReplacements = new createTableReplacementsImpala(dataReplacements);
                            tableBearingsReplacements.createTableAll('bearings');
                            let tableReplacementsReady = tableBearingsReplacements.getTable();
                
                            let dataBox_Repl = document.createElement('div')
                            dataBox_Repl.classList.add('dataBox')
                            dataBox_Repl.appendChild(tableFiltersReplacementsReady);
                            dataBox_Repl.appendChild(tableReplacementsReady);
                            app.appendChild(dataBox_Repl)
                            
                            // NavOptions
                            let optionsData = new createTableReplacementsImpala(dataReplacements);
                            let navOptions = document.querySelector('#opcje');
                            let options = optionsData.options();
                            let optionsTarget = optionsData.addReplacement();
                            navOptions.appendChild(options)
                            navOptions.appendChild(optionsTarget)
                        }
            else if (status != 200) {
                                alerts(status, dataAll.detail, 'alert-red');
                            }
            else if(statusRepl != 200){
                                alerts(statusRepl, dataReplacements.detail, 'alert-red');
                            }

        }catch(error){
            alerts('error', error, 'alert-red');
        }
        
    }
}