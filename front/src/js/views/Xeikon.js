import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { Xeikon_All_Data , Xeikon_Data} from "../createXeikonTables.js";
import { createChart } from "../chart/createChart.js";
import { alerts } from "../alerts/alerts.js";
import {hideloader, showloader, removeDbSettings } from "../common.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Impala");
    }

    async getData(){
        document.querySelector('#app').innerHTML = ''
        try{
            removeDbSettings();
            showloader();
            let app = document.querySelector('#app');
            let newChart = new createChart();
            newChart.getData();
            let chart = newChart.getChart();

            let [status, dataAll] = await callApiGet('xeikon');
            if (status == 200 ){
                hideloader();
                let description = '*całkowity przebieg urządzeń'
                let allTables = new Xeikon_All_Data(dataAll, description, newChart);
                allTables.createAll();
                let tableAllReady = allTables.getTable();

                let dataBox = document.createElement('div')
                dataBox.classList.add('dataBox')
                dataBox.appendChild(chart)
                dataBox.appendChild(tableAllReady);
                app.appendChild(dataBox);

            }else if (status != 200) {alerts(status, dataAll.detail, 'alert-red');}

            let tonerPath = 'xeikon/toner/'
            let dvlPath = 'xeikon/dvl/'
            let [statusToner, dataToner] = await callApiGet(tonerPath);
            let [statusDVL, dataDVL] = await callApiGet(dvlPath);
            if (statusToner == 200 && statusDVL == 200) {
                hideloader();
                let descriptionToner = '*całkowite zużycie tonera dla poszczególnych kolorów [gram]'
                let tonerTable = new Xeikon_Data(dataToner, descriptionToner, newChart, tonerPath);
                tonerTable.createAll(1);
                let tonerTableReady = tonerTable.getTable();
                
                let description = '*licznik DVL [A3] oraz ilość wymian [szt]';
                let dvlTable = new Xeikon_Data(dataDVL, description, newChart);
                dvlTable.createAll(2);
                let dvlTableReady = dvlTable.getTable();

                let DataBox = document.createElement('div');
                DataBox.classList.add('dataBox');
                DataBox.appendChild(tonerTableReady);;
                DataBox.appendChild(dvlTableReady);
                app.appendChild(DataBox);
            }
            else if (statusDVL != 200) {alerts(statusDVL, dataDVL.detail, 'alert-red');}
            else if (statusToner != 200) {alerts(statusToner, dataToner.detail, 'alert-red');};

            let fuserPath = 'xeikon/fuser/'
            let clicksPath = 'xeikon/clicks/'
            let [statusFuser, dataFuser] = await callApiGet(fuserPath);
            let [statusClicks, dataClicks] = await callApiGet(clicksPath);
            if (statusFuser == 200 && statusClicks == 200){
                hideloader();
                let descriptionFuser = '*aktualne zużycie fusera [A3] oraz ilość wymian [szt]';
                let fuserTable = new Xeikon_Data(dataFuser, descriptionFuser, newChart);
                fuserTable.createAll(1);
                let fuserTableReady = fuserTable.getTable();

                let descriptionClicks = '*aktualna ilość druku w kolorze oraz b&w [A3]';
                let clicksTable = new Xeikon_Data(dataClicks, descriptionClicks, newChart, clicksPath);
                clicksTable.createAll(1);
                let clicksTableReady = clicksTable.getTable();

                let dataBox = document.createElement('div');
                dataBox.classList.add('dataBox');
                dataBox.appendChild(fuserTableReady);
                dataBox.appendChild(clicksTableReady);
                app.appendChild(dataBox);

            }
            else if (statusFuser != 200) {alerts(statusFuser, dataFuser.detail, 'alert-red');}       
            else if (statusClicks != 200) {alerts(statusClicks, dataClicks.detail, 'alert-red');};          

        }catch(error){
            console.log(error)
            alerts('error', error, 'alert-red');
        }
        
    }
}