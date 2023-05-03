
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
        let description = this.descriptionsBox();
        let table = document.createElement('table');
        table.appendChild(theads);
        table.appendChild(tbody);
        this.tableBox.appendChild(table)
        this.tableBox.appendChild(description)
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
                if (key != 'filters' && key != 'bearings'){
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
            };
            tbody.appendChild(tr);
        });
        return tbody
    }

    descriptionsBox(){
        let descBox = document.createElement('div')
        descBox.classList.add('descBox')
        let descLabel = document.createElement('small')
        descLabel.innerText = '*całkowity przebieg urządzeń'
        descBox.appendChild(descLabel)

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
        this.units = []
        this.colors = []
    }

    createTableAll(changeType){
        let table = document.createElement('table');
        let thead = this.createTheadReplacement(changeType);
        let tbody
        if (changeType == 'filters'){
            tbody = this.createTbodyFilters();
        }else{
            tbody = this.createTbodyBearings();
        }
        
        table.appendChild(thead);
        table.appendChild(tbody);
        this.tableBox.appendChild(table)
        this.tableBox.appendChild(this.descriptionsBox(changeType))
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
                    for (const [key,val] of Object.entries(value)){
                        let each = document.createElement('td');
                        each.classList.add('table-td', 'clickable');
                        let date = document.createElement('p');
                        date.classList.add('replacement-date');
                        let quantity = document.createElement('p');
                        if(val['last_replacement'] != 'NaT'){
                            each.id = `filters-${unit.Name.split(' ')[1]}-${key}`;
                            each.onclick = () => {
                                if (each.classList.contains('activ')){
                                    let selected = document.querySelector('.selected-to-replace');
                                    if (selected){
                                        selected.classList.remove('selected-to-replace');
                                    }
                                    each.classList.add('selected-to-replace');
                                }
                            }
                            if (val['liter']*1000 >= this.data.filters_threshold){
                                each.classList.add('warning');
                            };
                            date.innerText = val['last_replacement'];
                            quantity.innerText = val['liter'];
                        }else{
                            date.innerText = 0;
                            quantity.innerText = 0;
                        }
                        each.appendChild(date);
                        each.appendChild(quantity);
                        tr.appendChild(each);
                    };
                };
                tbody.appendChild(tr);
            }; 
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
                each.classList.add('table-td', 'clickable');
                each.id = `bearings-${unit.Name}`
                each.onclick = () => {
                    if (each.classList.contains('activ')){
                        let selected = document.querySelector('.selected-to-replace');
                        if (selected){
                            selected.classList.remove('selected-to-replace');
                        }
                        each.classList.add('selected-to-replace');
                    }
                }
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
        let changeType_;
        switch (changeType){
            case 'filters':
                changeType_ = 'filtrów';
                break;
            case 'bearings':
                changeType_ = 'łożysk i pasków';
                break;
        }
        let descBox = document.createElement('div')
        descBox.classList.add('descBox')
        let descLabel = document.createElement('small')
        descLabel.innerText = `*ostatnia data wymiany oraz aktualny przebieg ${changeType_}`
        descBox.appendChild(descLabel)

        return descBox
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