

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
        
        let tableLabel = document.createElement('h3')
        tableLabel.innerText = 'Aktualny całkowity przebieg'
        let table = document.createElement('table');
        table.appendChild(theads);
        table.appendChild(tbody);
        this.tableBox.appendChild(tableLabel)
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
                tr.appendChild(each);
            };
            tbody.appendChild(tr);
        });
        return tbody
    }


    descriptions(){
        let descBox = document.createElement('div')
        descBox.classList.add('descBox')
        let descLabel = document.createElement('h3')
        descLabel.innerText = 'Opis:'
        let desc = document.createElement('p')
        desc.innerText = `Pozycje zaznaczone na zielono osiągnęły założony limit m2 w wysokości: ${this.target} m2`
        let changeTargetBtn = document.createElement('p')
        changeTargetBtn.classList.add('changeTargetBtn')
        changeTargetBtn.innerText = 'Zmień limit'
        changeTargetBtn.onclick = () => {
            if (!document.querySelector('.changeTargetBox')){
                descBox.appendChild(this.changeTarget())
            }
        }
        descBox.appendChild(descLabel)
        descBox.appendChild(desc)
        descBox.appendChild(changeTargetBtn)

        return descBox
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
    }

    createTableAll(element){
        let thead = this.createTheadReplacement(element);
        let tableLabel = document.createElement('h3')
        let tbody
        let change
        if (element == 'filters'){
            change = this.FilterChange();
            tbody = this.createTbodyFilters();
            tableLabel.innerText = 'Daty wymiany filtrów oraz ich aktualny przebieg'
        }else{
            tbody = this.createTbodyBearings();
            tableLabel.innerText = 'Daty wymiany łożysk/pasków oraz ich aktualny przebieg'
            change = this.FilterChange();
        }
        let table = document.createElement('table');
        table.appendChild(thead);
        table.appendChild(tbody);
        this.tableBox.appendChild(tableLabel)
        this.tableBox.appendChild(table)
        this.tableBox.appendChild(change)
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

    FilterChange(){
        let settingsBox = document.createElement('div')
        settingsBox.classList.add('filter-settings')
        let dateInput = document.createElement('input')
        dateInput.type = 'text'
        dateInput.setAttribute('data-toggle', 'datepicker')
        settingsBox.appendChild(dateInput)
        return settingsBox;
    }

    showDatePicker(){
        $('[data-toggle="datepicker"]').datepicker({
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