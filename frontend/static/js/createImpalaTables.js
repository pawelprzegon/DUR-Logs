import { callApiPut } from "./endpoints.js";
import { navigateTo } from "./index.js";

export class createTableAllImpala{
    constructor(data){
        this.data = data;
        this.tableBox = document.createElement('div')
        this.tableBox.classList.add('tableBox')
        this.table = document.createElement('table');
    }

    createTableAll(){
        let theads = this.createThead();
        let tbody = this.createTbody();
        
        let table = document.createElement('table');
        table.appendChild(theads);
        table.appendChild(tbody);
        this.tableBox.appendChild(table)
    }

    createThead(){
        const heads = ['Nazwa', '[m2]', '[ml]', 'Ostatni druk'];
        let thead = document.createElement('thead')
        let tr = document.createElement('tr');
        heads.forEach(head =>{
            let each = document.createElement('th');
            each.classList.add('table-th');
            each.innerText = head
            tr.appendChild(each)
            thead.appendChild(tr)
        })

        return thead
    }

    createTbody(){
        let tbody = document.createElement('tbody')
        this.data.forEach(unit =>{
            let tr = document.createElement('tr');
            for (const [key, value] of Object.entries(unit)){
                let each = document.createElement('td');
                each.classList.add('table-td');
                each.innerText = value;
                if(key == 'name'){
                    each.classList.add('unit');
                    each.onclick = () => {
                        let unit = document.querySelector(`#unit${value.split(' ')[1]}`);
                        unit.click();
                    }}
                tr.appendChild(each);
            };
            tbody.appendChild(tr);
        });
        return tbody
    }

    getTable(){
        return this.tableBox;
    }


}

export class createTableReplacementsImpala{
    constructor(data){
        this.data = data;
        this.tableBox = document.createElement('div')
        this.tableBox.classList.add('tableBox')
        this.table = document.createElement('table');
        this.units = []
        this.colors = []
    }

    createTableAll(changeType){
        let table = document.createElement('table');
        let thead = this.createTheadReplacement(changeType);
        let tableLabel = document.createElement('h3')
        let tbody
        if (changeType == 'filters'){
            tbody = this.createTbodyFilters();
            tableLabel.innerText = 'Daty wymiany filtrów oraz ich aktualny przebieg'
        }else{
            tbody = this.createTbodyBearings();
            tableLabel.innerText = 'Daty wymiany łożysk/pasków oraz ich aktualny przebieg'
        }
        
        table.appendChild(thead);
        table.appendChild(tbody);
        this.tableBox.appendChild(tableLabel)
        this.tableBox.appendChild(table)
        this.tableBox.appendChild(this.descriptionsBox(changeType))
        this.tableBox.appendChild(this.replaceBox(changeType))
    }

    createTheadReplacement(replace){
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');
        let name = document.createElement('th');
        name.innerText = 'Nazwa';
        name.classList.add('table-th')
        tr.appendChild(name);
        thead.appendChild(tr);
        if (replace == 'filters'){
            this.data.units[0].filters.forEach(color =>{
                for (const key of Object.keys(color)){
                    let each = document.createElement('th');
                    each.classList.add('table-th');
                    each.innerText = key.capitalize();
                    this.colors.push(key.capitalize());
                    tr.appendChild(each);
                    thead.appendChild(tr);
                };
            }); 
        }else if(replace == 'bearings'){
            let each = document.createElement('th');
            each.classList.add('table-th');
            each.innerText = 'Łożyska/paski';
            tr.appendChild(each);
            thead.appendChild(tr);
        }
        return thead
    }

    createTbodyFilters(){
        let tbody = document.createElement('tbody');
        this.data.units.forEach(unit =>{
            if (!unit.hasOwnProperty('filters_threshold') && !unit.hasOwnProperty('bearings_threshold')){
                let tr = document.createElement('tr');
                let name = document.createElement('td');
                name.innerText = unit.Name;
                name.classList.add('table-th')
                this.units.push(unit.Name)
                tr.append(name);
                for (const value of Object.values(unit.filters)){
                    for (const val of Object.values(value)){
                        if(val['last_replacement'] != 'NaT'){
                            let each = document.createElement('td');
                            each.classList.add('table-td');
                            if (val['liter']*1000 >= this.data.filters_threshold){
                                each.classList.add('warning');
                            };
                            let date = document.createElement('p');
                            date.classList.add('replacement-date');
                            date.innerText = val['last_replacement'];
                            let quantity = document.createElement('p');
                            quantity.innerText = val['liter'];
                            each.appendChild(date);
                            each.appendChild(quantity);
                            tr.appendChild(each);
                        };
                    };
                };
                tbody.appendChild(tr);
            }
            
        });
        return tbody
    }

    createTbodyBearings(){
        let tbody = document.createElement('tbody');
        this.data.units.forEach(unit =>{
            if (!unit.hasOwnProperty('filters_threshold') && !unit.hasOwnProperty('bearings_threshold')){
                let tr = document.createElement('tr');
                let name = document.createElement('td');
                name.innerText = unit.Name;
                name.classList.add('table-th')
                tr.append(name);

                let each = document.createElement('td');
                each.classList.add('table-td');
                if (unit.bearings.tys_m2*1000 >= this.data.bearings_threshold){
                    each.classList.add('warning');
                };
                let date = document.createElement('p');
                date.classList.add('replacement-date');
                date.innerText = unit.bearings.last_replacement;
                let quantity = document.createElement('p');
                quantity.innerText = unit.bearings.tys_m2;
                each.appendChild(date);
                each.appendChild(quantity);
                tr.appendChild(each);
                tbody.appendChild(tr);
            }
        });
        return tbody
    }

    descriptionsBox(changeType){
        let descBox = document.createElement('div')
        descBox.classList.add('descBox-Impala')
        
        let descLabel = document.createElement('small')
        descLabel.innerText = 'Dane przedstawiają ostatnią datę wymiany oraz aktualny przebieg'
        let changeTargetBtn = document.createElement('p')
        changeTargetBtn.classList.add('changeTargetBtn')
        changeTargetBtn.innerText = 'Dodaj wymianę'
        changeTargetBtn.onclick = () => {
            if (!document.querySelector(`.replace-${changeType}`)){
                document.querySelector(`.replaceBox-${changeType}`).appendChild(this.showReplace(changeType));
                this.showDatePicker(changeType);
            }
        }
        descBox.appendChild(changeTargetBtn)
        descBox.appendChild(descLabel)

        return descBox
    }

    replaceBox(changeType){
        let replaceBox = document.createElement('div')
        replaceBox.classList.add(`replaceBox-${changeType}`)
        return replaceBox
    }

    showReplace(changeType){
        let dropDownUnits = this.createDropDown(this.units, 'units', changeType)
        let dropDownColors = this.createDropDown(this.colors, 'colors', changeType)

        let settingsBox = document.createElement('div')
        settingsBox.classList.add(`replace-${changeType}`)
        
        let form = document.createElement('form');
        form.classList.add('changePartsForm');
        let dateInput = document.createElement('input')
        dateInput.type = 'text'
        dateInput.classList.add('changeInput');
        dateInput.placeholder = 'data...';
        dateInput.setAttribute(`data-toggle-${changeType}`, 'datepicker')
        let submit = document.createElement('input');
        submit.classList.add('changePartsBtn');
        submit.type = 'submit';
        submit.value = 'zapisz';
        form.onsubmit = async (event) => {
            event.preventDefault();
            dateInput.focus();
            
            let what = changeType
            let replaceDate = dateInput.value;
            let unit = document.querySelector(`#sBtn-units-${changeType}`).innerText;
            let color = document.querySelector(`#sBtn-colors-${changeType}`).innerText;
            console.log(what, replaceDate, unit, color)
            let [response, status] = await callApiPut(`impalas/replacements/${what}&${replaceDate}&${unit}&${color}`);
            console.log(status, response);
            navigateTo('/impala');
        }

        form.appendChild(dateInput)
        form.appendChild(dropDownUnits)
        form.appendChild(dropDownColors)
        form.appendChild(submit)
        settingsBox.appendChild(form)
        return settingsBox;
    }

    createDropDown(data, id, changeType){
        let Box = document.createElement('div');
        Box.classList.add('select-menu')
        Box.id = id;
        let selectBtn = document.createElement('div');
        selectBtn.classList.add('select-btn');
        let sBtnText = document.createElement('span');
        sBtnText.id = (`sBtn-${id}-${changeType}`);
        sBtnText.innerText = '-';
        let options = document.createElement('ul');
        options.classList.add('options')
        data.forEach(unit => {
            let unit_ = document.createElement('li');
            unit_.id = unit;
            unit_.innerText = unit;
            unit_.classList.add('option')
            options.appendChild(unit_);
            unit_.onclick = () => {
                sBtnText.innerText = unit_.innerText;
            }
        });
        selectBtn.appendChild(sBtnText)
        Box.appendChild(selectBtn);
        Box.appendChild(options);
        Box.onclick = () => {document.querySelector(`#${id}`).classList.toggle("active")}
        return Box
    }

    showDatePicker(changeType){
        $(`[data-toggle-${changeType}="datepicker"]`).datepicker({
            format: 'yyyy-mm-dd',
            language: 'pl-PL'
        });
    }

    getTable(){
        return this.tableBox;
    }
}



Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});