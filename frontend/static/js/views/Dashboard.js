import AbstractView from "./AbstractView.js";
import { callApiGet } from "../endpoints.js";
import { onlyUnique, calculateChartSize } from "../common.js";
import { createDetailsTable } from "../createDashboardTable.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
        this.myChart
        this.app = document.querySelector('#app');
    }

    async getData(){
        document.getElementById('app').innerHTML = ''

        let [statusMutoh, dataMutoh] = await callApiGet('mutohs/by_month')
        let [statusImpala, dataImpala] = await callApiGet('impalas/by_month')

        let period = [
            {'name': 'msc 3'},
            {'name': 'msc 6'},
            {'name': 'msc 12'},
            {'name': 'msc all',}
        ]
        
        if (statusMutoh == 200){
            this.chartArea = document.createElement('div')
            this.chartArea.classList.add('chart-area')
            this.dropDownBox = document.createElement('div')
            this.dropDownBox.classList.add('dropDown-Box')
            this.createChartCanvas();
            this.createUnitsDropDownList(period, '', 'Okres');
            this.createUnitsDropDownList(dataMutoh, 'mutohs/', 'Mutoh');
            this.createUnitsDropDownList(dataImpala, 'impalas/', 'Impala');
        }
    }

    createChartCanvas(){
        const ChartsArea = document.createElement('div');
        ChartsArea.classList.add("chart")
        ChartsArea.style.width = calculateChartSize();
        const canvas = document.createElement('canvas');
        canvas.id = 'charts' ;
        canvas.style = 'null';
        ChartsArea.appendChild(canvas);
        this.chartArea.appendChild(ChartsArea);
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
        let units = []
        data.forEach(element => {
            units.push(element.name)
        });

        var unique = units.filter(onlyUnique);
        unique.forEach(element => {
            let unit = document.createElement('li')
            unit.classList.add('option')
            unit.innerText = element.split(' ')[1]
            unit.onclick = () => {
                this.generateData(unit, element, label, path)
            }
            listOfUnits.appendChild(unit)
        });

        dropdown.appendChild(listOfUnits)
        this.dropDownBox.appendChild(dropdown)
        this.chartArea.appendChild(this.dropDownBox);
        this.app.appendChild(this.chartArea)

        const optionMenu = document.querySelector(`#${label}`);
        const options = optionMenu.querySelectorAll(".option");

        options.forEach(option =>{

            option.addEventListener("click", ()=>{
                if (label != 'Okres'){
                    document.querySelector('#sBtn-text-Mutoh').innerText = '-';
                    document.querySelector('#sBtn-text-Impala').innerText = '-';
                }
                btnText.innerText = option.innerText;

                let menus = document.querySelectorAll('.active')
                menus.forEach(menu =>{
                    menu.classList.remove("active");
                })
            });
        });
        
    }


    async generateData(unit, element, label, path){
        let activated = document.querySelector('.activated')
        let selected = document.querySelector('.selected')
        if (label != 'Okres'){
            let period = document.querySelector('#sBtn-text-Okres').innerText
            if (selected != null){
                activated.classList.remove('activated')
                selected.classList.remove('selected')
            }
            if (period == '-'){
                period = 'all'
            }
            let [status, data] = await callApiGet(path+element+`/${period}`)
            this.createChart(element, data, label)
            this.createDetails(data)
            document.querySelector(`#${label}`).classList.add('activated')
            unit.classList.add('selected')
        }else{
            let period = unit.innerText
            if (selected != null){
                let activePath = ((activated.firstChild.innerText).toLowerCase())
                let activeLabel = (selected.innerText).split(' ')
                let chartId = activated.firstChild.innerText+' '+selected.innerText
                let [status, data] = await callApiGet(activePath+'s/'+activated.firstChild.innerText+' '+selected.innerText+`/${period}`)
                this.createChart(chartId, data, activated.firstChild.innerText)
                this.createDetails(data)
            }
        }
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

    createChart(id, data, label){
        
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
        this.myChart = new Chart(ctx, {
            type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "m2",
                    data: Squaremeter,
                    // backgroundColor: "rgba(12, 143, 3, 0.3)",
                    borderColor: "rgba(12, 143, 3, 0.3",
                    tension: 0.2,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: "ml",
                    data: Total_Ink,
                    // backgroundColor: "rgba(176, 0, 0,0.3)",
                    borderColor: "rgba(176, 0, 0,0.3)",
                    tension: 0.2,
                    borderWidth: 2,
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
}

