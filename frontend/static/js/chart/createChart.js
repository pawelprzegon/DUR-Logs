import { createDetailsTable } from "../createDashboardTable.js";
import { callApiGet } from "../endpoints.js";
import { uniqueSortedList } from "../common.js";

export class createChart {
    constructor(label) {
        this.myChart
        this.path
        this.lastUnit
        this.label = label
        this.chartArea = document.createElement('div')
        this.chartArea.classList.add('chart-area')
    }

    async getData(){
        if(this.label == 'Mutoh'){
            this.path = 'mutohs/'
        }else if(this.label == 'Impala'){
            this.path = 'impalas/'
        }
        let [status, data] = await callApiGet(this.path+'by_month')

        let period = [
            {'name': 'msc 3'},
            {'name': 'msc 6'},
            {'name': 'msc 12'},
            {'name': 'msc all',}
        ]
        
        if (status == 200){
            this.chartArea.appendChild(this.createChartCanvas());
            this.dropDownBox = document.createElement('div');
            this.dropDownBox.classList.add('dropDown-Box');
            
            this.dropDownBox.appendChild(this.createUnitsDropDownList(period, '', 'Okres'));
            this.dropDownBox.appendChild(this.createUnitsDropDownList(data, this.path, this.label));

            this.chartArea.appendChild(this.dropDownBox);
        }
    }

    
    
    createChartCanvas(){
        const ChartsArea = document.createElement('div');
        ChartsArea.classList.add("chart")
        ChartsArea.style.width = '500px';
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
            // this.createDetails(data)
            document.querySelector(`#${label}`).classList.add('activated')
            unit.classList.add('selected')
        }else{
            let period = unit.innerText
            if (selected != null){
                let activePath = ((activated.firstChild.innerText).toLowerCase())
                let chartId = activated.firstChild.innerText+' '+selected.innerText
                let [status, data] = await callApiGet(activePath+'s/'+activated.firstChild.innerText+' '+selected.innerText+`/${period}`)
                this.createChart(chartId, data)
            }
        }
        btnText.innerText = unit.innerText;
    }

    createDetails(data){
        let detailsBox = document.querySelector('.details-area')
        if (document.querySelector('.details-area') != null){
            detailsBox.innerHTML = ''
        }else{
            detailsBox = document.createElement('div')
        }
        detailsBox.classList.add('details-area')
        let detailsTable = new createDetailsTable(data);
        detailsTable.prepareData();
        detailsTable.createThead();
        detailsTable.createTbody();
        let table = detailsTable.getTable()
        detailsBox.appendChild(table)
        this.app.appendChild(detailsBox)
    }

    createChart(id, data){
        
        
        let Squaremeter = []
        let Total_Ink = []
        let labels = []
        data.forEach(element => {
            labels.push(element.date)
            Squaremeter.push(element.Squaremeter)
            Total_Ink.push(element.Total_Ink)
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
                    label: "m2",
                    data: Squaremeter,
                    tension: 0.2,
                    borderWidth: 2,
                    backgroundColor: gradientM2,
                    pointBackgroundColor: 'white',
                    borderColor: 'rgb(61, 196, 90)',
                    fill: true,
                },
                {
                    label: "ml",
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

function calculateChartSize(){
    let chartWidth = '500px'
    if ( $(window).width() <= 600) {     
      chartWidth = '350px'
    }
    else if (( $(window).width() > 600) && ( $(window).width() <= 900)){
      chartWidth = '450px'
    }else if (( $(window).width() > 900) && ( $(window).width() <= 1500)){
        chartWidth = '650px'
    }else{
      chartWidth = '500px'
    }
    return chartWidth
}