import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import {createTableAllImpala, createTableReplacementsImpala} from '../createImpalaTables.js'
import { createChart } from "../chart/createChart.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Impala");
    }

    async getData(){
        document.getElementById('app').innerHTML = ''

        let [status, dataAll] = await callApiGet('impalas/all');
        let [statusRepl, dataReplacements] = await callApiGet('impalas/replacements/');
        if (status == 200){
            let app = document.querySelector('#app');
            let newChart = new createChart('Impala');
            newChart.getData();
            let chart = newChart.getChart();
            let allTables = new createTableAllImpala(dataAll);
            allTables.createTableAll();
            let tableAllReady = allTables.getTable();
            app.appendChild(chart);
            app.appendChild(tableAllReady);
        }else{
            // tutaj musi byc alert że coś nie tak 
        }

    
        if (statusRepl == 200){
            let tableFiltersReplacements = new createTableReplacementsImpala(dataReplacements);
            tableFiltersReplacements.createTableAll('filters')
            let tableFiltersReplacementsReady = tableFiltersReplacements.getTable();
            
    
            let tableBearingsReplacements = new createTableReplacementsImpala(dataReplacements);
            tableBearingsReplacements.createTableAll('bearings');
            let tableReplacementsReady = tableBearingsReplacements.getTable();

            app.appendChild(tableFiltersReplacementsReady);
            app.appendChild(tableReplacementsReady);
            app.appendChild(tableFiltersReplacements.replaceBox())
        }else{
            // tutaj musi byc alert że coś nie tak 
        }
    }
}