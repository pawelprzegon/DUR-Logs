import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import {Impala_All_Data, createTableReplacementsImpala} from '../createImpalaTables.js'
import { createChart } from "../chart/createChart.js";
import { alerts } from "../alerts/alerts.js";
import { Replacement, hideloader, removeDbSettings, showloader } from "../common.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Impala");
    }

    async getData(){
        document.querySelector('#app').innerHTML = ''
        try{
            showloader();
            let app = document.querySelector('#app');
            let newChart = new createChart();
            newChart.getData();
            let chart = newChart.getChart();

            let [status, dataAll] = await callApiGet('impala');
            let [statusRepl, dataReplacements] = await callApiGet('impala/replacements/');
            if (status == 200 && statusRepl == 200) {
                hideloader();
                
                let allTables = new Impala_All_Data(dataAll, newChart);
                allTables.createAll();
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
                let navOptions = document.querySelector('#opcje');

                removeDbSettings();
                // filters and bearings replacements
                let partsDesc = 'Wprowadź datę oraz zaznacz pozycję w tabeli:'
                let partsLbl = 'Wprowadź wymianę'
                let partsPlchold = 'data'
                let partsPath = '/impala'
                let partsRepl = new Replacement(partsDesc, partsLbl, partsPlchold, partsPath);
                partsRepl.createBox();
                partsRepl.callendarReplacement();
                navOptions.appendChild(partsRepl.getReplaceBox())

                // change targets for filters
                let fTargetDesc = 'Wprowadź nowy target [ml]:';
                let fTargetLbl = 'Zmień target dla filtrów';
                let fTargetPlchold = 'wartość';
                let fTargetPath = '/impala';
                let fTarget = new Replacement(fTargetDesc, fTargetLbl, fTargetPlchold, fTargetPath);
                fTarget.createBox();
                fTarget.inputValue('impala/settings/filters&');
                navOptions.appendChild(fTarget.getReplaceBox());

                // change targets for bearings
                let bTargetDesc = 'Wprowadź nowy target [m2]:';
                let bTargetLbl = 'Zmień target dla łożysk';
                let bTargetPlchold = 'wartość';
                let bTargetPath = '/impala';
                let bTarget = new Replacement(bTargetDesc, bTargetLbl, bTargetPlchold, bTargetPath);
                bTarget.createBox();
                bTarget.inputValue('impala/setting/bearings&');
                navOptions.appendChild(bTarget.getReplaceBox());


            }
            else if (status != 200) {
                                alerts(status, dataAll.detail, 'alert-red');
                            }
            else if(statusRepl != 200){
                                alerts(statusRepl, dataReplacements.detail, 'alert-red');
                            }

        }catch(error){
            console.log(error)
            alerts('error', error, 'alert-red');
        }
        
    }
}