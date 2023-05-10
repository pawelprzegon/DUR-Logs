import { callApiGet } from "../endpoints.js";
import { uniqueSortedList } from "../common.js";

export class createChart {
    constructor(data, label) {
        this.data = data
        this.myChart
        this.path
        this.lastUnit
        this.label = label
        this.chartArea = document.createElement('div')
        this.chartArea.classList.add('chart-area')
    }

    async getData(){
        if(this.label == 'Mutoh'){
            this.path = 'mutoh/chart/'
        }else if(this.label == 'Impala'){
            this.path = 'impala/chart/'
        }else if(this.label == 'Xeikon'){
            this.path = 'xeikon/chart/'
        }
        let period = [
            {'name': 'msc 1'},
            {'name': 'msc 3'},
            {'name': 'msc 6'},
            {'name': 'msc 12'},
            {'name': 'msc all',}
        ]

        this.chartArea.appendChild(this.createChartCanvas());
        this.dropDownBox = document.createElement('div');
        this.dropDownBox.classList.add('dropDown-Box');
        
        this.dropDownBox.appendChild(this.createUnitsDropDownList(period, '', 'Okres'));
        this.dropDownBox.appendChild(this.createUnitsDropDownList(this.data, this.path, this.label));

        this.chartArea.appendChild(this.dropDownBox);
        }

    
    createChartCanvas(){
        const ChartsArea = document.createElement('div');
        ChartsArea.classList.add("chart")
        const canvas = document.createElement('canvas');
        canvas.id = 'charts' ;
        canvas.style = 'null';
        ChartsArea.appendChild(canvas);
        return ChartsArea
    }

    createUnitsDropDownList(data, path, label){
        let dropdown = document.createElement('div')
        dropdown.classList.add('select-menu')
        dropdown.id = label
        let lbl = document.createElement('p')
        lbl.classList.add('dropdown-label')
        if (label == 'Okres'){lbl.innerText = label+' [msc]'}
        else{lbl.innerText = label}
        
        let btn = document.createElement('div')
        btn.classList.add('select-btn')
        let btnText = document.createElement('span')
        btnText.classList.add('sBtn-text')
        btnText.id = 'sBtn-text-'+label
        btnText.innerText = '-'
        btn.appendChild(btnText)
        dropdown.appendChild(lbl)
        dropdown.appendChild(btn)

        // aktywny dropdown
        btn.onclick = () => {document.querySelector(`#${label}`).classList.toggle("active")}

        let listOfUnits = document.createElement('ul')
        listOfUnits.classList.add('options')
        let unique = uniqueSortedList(data, label)
        unique.forEach(element => {
            let unit = document.createElement('li');
            unit.classList.add('option');
            if(label != 'Okres'){
                unit.id = 'unit'+element.split(' ')[1];
            }
            unit.innerText = element.split(' ')[1];
            unit.onclick = () => {
                this.generateData(unit, element, label, path, btnText);
            }
            listOfUnits.appendChild(unit);
        });

        
        dropdown.appendChild(listOfUnits);
        return dropdown
    }


    async generateData(unit, element, label, path, btnText){
        
        let menus = document.querySelectorAll('.active')
        menus.forEach(menu =>{
            menu.classList.remove("active");
        })

        let activated = document.querySelector('.activated')
        let selected = document.querySelector('.selected')
        if (label != 'Okres'){
            document.querySelector(`#sBtn-text-${this.label}`).innerText = '-';
            let period = document.querySelector('#sBtn-text-Okres').innerText
            if (selected != null){
                activated.classList.remove('activated')
                selected.classList.remove('selected')   
            }
            if (period == '-'){
                period = 'all'
                document.querySelector('#sBtn-text-Okres').innerText = 'all'
            }
            let [status, data] = await callApiGet(path+element+`/${period}`)
            this.createChart(element, data)
            document.querySelector(`#${label}`).classList.add('activated')
            unit.classList.add('selected')
        }else{
            let period = unit.innerText
            if (selected != null){
                let activePath = ((activated.firstChild.innerText).toLowerCase())
                let chartId = activated.firstChild.innerText+' '+selected.innerText
                let [status, data] = await callApiGet(activePath+'/'+chartId+`/${period}`)
                console.log(status, data)
                this.createChart(chartId, data)
            }
        }
        btnText.innerText = unit.innerText;
    }

    reduceDate(date){
        let tmpLbl = date.split('-');
        tmpLbl.pop();
        return tmpLbl.join('-')
    }

    createChart(id, data){
        let Squaremeter = []
        let Total_Ink = []
        let labels = []
        let label1
        let label2
        data.forEach(element => {
            labels.push(this.reduceDate(element.date))
            if (element.hasOwnProperty('Squaremeter') && element.hasOwnProperty('Total_Ink')){
                Squaremeter.push(element.Squaremeter)
                Total_Ink.push(element.Total_Ink)
                label1 = 'm2'
                label2 = 'ml'
            }
            else if(element.hasOwnProperty('printed') && element.hasOwnProperty('toner')){
                Squaremeter.push(element.printed)
                Total_Ink.push(element.toner)
                label1 = 'A3'
                label2 = 'gram'
            }
            
        });
        if(this.myChart != undefined){
            this.myChart.destroy();
        }
        
        let ctx = document.getElementById("charts").getContext('2d');
        let gradientM2 = ctx.createLinearGradient(0, 0, 0, 450);
        gradientM2.addColorStop(0, 'rgba(61, 196, 90, 0.7)');
        gradientM2.addColorStop(0.5, 'rgba(61, 196, 90, 0.3)');
        gradientM2.addColorStop(1, 'rgba(61, 196, 90, 0)');

        let gradientMl = ctx.createLinearGradient(0, 0, 0, 450);
        gradientMl.addColorStop(0, 'rgba(215, 72, 72, 0.7)');
        gradientMl.addColorStop(0.5, 'rgba(215, 72, 72, 0.3)');
        gradientMl.addColorStop(1, 'rgba(215, 72, 72, 0)');


        this.myChart = new Chart(ctx, {
            type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: label1,
                    data: Squaremeter,
                    tension: 0.2,
                    borderWidth: 2,
                    backgroundColor: gradientM2,
                    pointBackgroundColor: 'white',
                    borderColor: 'rgb(61, 196, 90)',
                    fill: true,
                },
                {
                    label: label2,
                    data: Total_Ink,
                    tension: 0.2,
                    borderWidth: 2,
                    backgroundColor: gradientMl,
                    pointBackgroundColor: 'white',
                    borderColor: 'rgb(215, 72, 72)',
                    fill: true,
                },
            ]
        },
        options: {
            maintainAspectRatio: 2,
            responsive: true,
            plugins: {
            title: {
                display: true,
                text: id,
                padding: {
                top: 10,
                bottom: 20
                },
                font: {
                weight: 'bold',
                size: 16,
                }
            },
            tooltip: {
                mode: 'index'
            },
            },
            interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
            },
            scales: {
            x: {
                title: {
                display: true,
                text: 'Month'
                }
            },
            y: {
                stacked: false,
                title: {
                display: true,
                text: 'Value'
                },
                min: 0,
                // max: max,
                ticks: {
                stepSize: 1
                }
            }
            }
            }
        });
    }

    getChart(){
        return this.chartArea
    }

    
}


function reEscape(s) {
    return s.replace(/([.*+?^$|(){}\[\]])/mg, "\\$1");
}


