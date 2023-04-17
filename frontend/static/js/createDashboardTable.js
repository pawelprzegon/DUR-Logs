export class createDetailsTable{
    constructor(data) {
        this.data = data
        this.table = document.createElement('table');
    }

    prepareData(){
        this.sumM2 = 0
        this.sumInk = 0
        let dates = []
        this.data.forEach(element => {
            this.sumM2 += element.Squaremeter
            this.sumInk += element.Total_Ink
            dates.push(new Date(element.date))
        });
        this.sumM2 = this.sumM2.toFixed(0)
        this.sumInk = this.sumInk.toFixed(0)
        this.maxDate=new Date(Math.max.apply(null,dates)).toISOString().split('T')[0];
        this.minDate=new Date(Math.min.apply(null,dates)).toISOString().split('T')[0];   
    }

    createThead(){
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');

        let m2 = document.createElement('th');
        let ink = document.createElement('th');
        let from = document.createElement('th');
        let to = document.createElement('th');
        m2.classList.add('table-th');
        ink.classList.add('table-th');
        from.classList.add('table-th');
        to.classList.add('table-th');
        m2.innerText = 'Suma m2'
        ink.innerText = 'Suma ink'
        from.innerText = 'Od'
        to.innerText = 'Do'
        tr.appendChild(m2);
        tr.appendChild(ink);
        tr.appendChild(from);
        tr.appendChild(to);
        thead.appendChild(m2);
        thead.appendChild(ink);
        thead.appendChild(from);
        thead.appendChild(to);
        this.table.appendChild(thead);
    }

    createTbody(){
        let tbody = document.createElement('tbody')
        let tr = document.createElement('tr');
        
        let m2 = document.createElement('td');
        let ink = document.createElement('td');
        let from = document.createElement('td');
        let to = document.createElement('td');
        m2.innerText = this.sumM2
        ink.innerText = this.sumInk
        from.innerText = this.minDate
        to.innerText = this.maxDate
        m2.classList.add('table-td');
        ink.classList.add('table-td');
        from.classList.add('table-td');
        to.classList.add('table-td');
        tr.appendChild(m2);
        tr.appendChild(ink);
        tr.appendChild(from);
        tr.appendChild(to);

        tbody.appendChild(tr);

        this.table.appendChild(tbody)
    }
    getTable(){
        return this.table;
    }
}