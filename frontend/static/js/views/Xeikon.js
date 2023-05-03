import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import {createTableAllImpala, createTableReplacementsImpala} from '../createImpalaTables.js'
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
            let [status, dataAll] = await callApiGet('xeikon');
            if (status == 200) {
                            hideloader();
                            console.log(status)
                            console.log(dataAll)
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