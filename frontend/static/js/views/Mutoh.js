import AbstractView from "./AbstractView.js";
import {callApiGet} from "../endpoints.js"
import { createTablesMutoh } from "../createMutohTables.js";


export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Mutoh");

    }

    async getData(){
        document.getElementById('app').innerHTML = ''

        let [status, data] = await callApiGet('mutohs/all');
        let [statusTarget, target] = await callApiGet('mutohs/target')
        let app = document.querySelector('#app');
        let tables = new createTablesMutoh(data,target.target);
        tables.createTables();
        let descripts = tables.descriptions();
        let [tableUnused, tableInUse] = tables.getTables();
        app.appendChild(tableInUse)
        app.appendChild(tableUnused)
        app.appendChild(descripts)

    }

    
}