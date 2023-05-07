import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { Xeikon_All_Data , Xeikon_Toner_Data} from "../createXeikonTables.js";
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
            showloader();
            let [status, dataAll] = await callApiGet('xeikon');
            let [statusToner, dataToner] = await callApiGet('xeikon/toner/');
            if (status == 200 && statusToner == 200) {
                            hideloader();
                            let app = document.querySelector('#app');
                            let newChart = new createChart(dataAll, 'Xeikon');
                            newChart.getData();
                            let chart = newChart.getChart();

                            let allTables = new Xeikon_All_Data(dataAll);
                            allTables.createAll();
                            let tableAllReady = allTables.getTable();
                            let dataBox = document.createElement('div')
                            dataBox.classList.add('dataBox')
                            dataBox.appendChild(chart)
                            dataBox.appendChild(tableAllReady);
                            app.appendChild(dataBox); 

                            let tonerTable = new Xeikon_Toner_Data(dataToner);
                            tonerTable.createAll();
                            let tonerTableReady = tonerTable.getTable();
                            let tonerDataBox = document.createElement('div')
                            tonerDataBox.classList.add('dataBox')
                            tonerDataBox.appendChild(tonerTableReady);
                            app.appendChild(tonerDataBox);

                            removeDbSettings();

                        }
            else if (status != 200) {
                                alerts(status, dataAll.detail, 'alert-red');
                            }

        }catch(error){
            console.log(error)
            alerts('error', error, 'alert-red');
        }
        
    }
}