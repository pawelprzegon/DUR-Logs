

export class Xeikon_All_Data{
    constructor(data){
        this.data = data;
        this.tableBox = document.createElement('div')
        this.tableBox.classList.add('tableBox')
        this.table = document.createElement('table');
    }

    createAll(){
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
        const heads = ['Nazwa', 'Serial number', '[A3]', '[gram]', 'data'];
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
        let suma = 0
        let tbody = document.createElement('tbody')
        this.data.forEach(unit =>{
            let tr = document.createElement('tr');
            for (const [key, value] of Object.entries(unit)){
                let each = document.createElement('td');
                each.classList.add('table-td');
                each.innerText = value;
                if(key == 'unit'){
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

export class Xeikon_Toner_Data{
    constructor(data){
        this.data = data;
        this.tableBox = document.createElement('div')
        this.tableBox.classList.add('tableBox')
        this.table = document.createElement('table');
    }

    createAll(){
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
        let thead = document.createElement('thead')
        let tr = document.createElement('tr');
        let each = document.createElement('th');
        each.classList.add('table-th');
        each.innerText = 'Nazwa'
        tr.appendChild(each)
        thead.appendChild(tr)
        for (const value of Object.values(this.data)){
            for (const key of Object.keys(value)){
                let each = document.createElement('th');
                each.classList.add('table-th');
                each.innerText = key
                tr.appendChild(each)
                thead.appendChild(tr)
            }
            break
        }
        
        return thead
    }

    createTbody(){
        let suma = 0
        let tbody = document.createElement('tbody')
        for (const [k,v] of Object.entries(this.data)){
            let tr = document.createElement('tr');
            let each = document.createElement('td');
            each.classList.add('table-td');
            each.innerText = k;
            tr.appendChild(each);
            for (const [key, value] of Object.entries(v)){
                let each = document.createElement('td');
                each.classList.add('table-td');
                each.innerText = value;
                tr.appendChild(each);
            };
            tbody.appendChild(tr);
        };
        return tbody
    }

    descriptionsBox(){
        let descBox = document.createElement('div')
        descBox.classList.add('descBox')
        let descLabel = document.createElement('small')
        descLabel.innerText = '*całkowite zużycie tonera dla poszczególnych kolorów'
        descBox.appendChild(descLabel)

        return descBox
    }

    getTable(){
        return this.tableBox;
    }
}