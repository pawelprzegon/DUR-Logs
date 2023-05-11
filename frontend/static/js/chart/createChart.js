import { callApiGet } from "../endpoints.js";
import { uniqueSortedList } from "../common.js";

export class createChart {
    constructor() {
        this.myChart
        this.path
        this.lastUnit
        this.chartArea = document.createElement('div')
        this.chartArea.classList.add('chart-area')
    }

    async getData(){
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
        // this.dropDownBox.appendChild(this.createUnitsDropDownList(this.data, this.path, this.label));

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
                // btnText.innerText = element.split(' ')[1]
                // this.generateData(unit, element, label, path, btnText);
            }
            listOfUnits.appendChild(unit);
        });

        
        dropdown.appendChild(listOfUnits);
        return dropdown
    }


    reduceDate(date){
        let tmpLbl = date.split('-');
        tmpLbl.pop();
        return tmpLbl.join('-')
    }

    createChart(unit, data){
        let dataset = {}
        let labels = []
        let label = {}
        data.forEach(element => {
            labels.push(this.reduceDate(element.date))
            for (const[key, value] of Object.entries(element)){
                if (key != 'date' && key != 'unit'){
                    if (dataset[key]){
                        dataset[key].push(value)
                    }else{
                        dataset[key] = [value]
                    } 
                }
                if (key == 'Squaremeter'){
                    label[key] = 'm2'
                }else if (key == 'Total_Ink'){ 
                    label[key] = 'ml'
                }
                else if(key == 'printed'){
                    label[key] = 'A3'
                }
                else if(key == 'date' || key == 'unit'){
                }
                else{
                    label[key] = 'gram'
                }
            }  
        }); 
        if(this.myChart != undefined){
            this.myChart.destroy();
        }
        
        let ctx = document.getElementById("charts").getContext('2d');
        let colors = []
        let CMYKcolors = []

        let red = ctx.createLinearGradient(0, 0, 0, 450);
        red.addColorStop(0, 'rgba(215, 72, 72, 0.7)');
        red.addColorStop(0.5, 'rgba(215, 72, 72, 0.3)');
        red.addColorStop(1, 'rgba(215, 72, 72, 0)');

        let green = ctx.createLinearGradient(0, 0, 0, 450);
        green.addColorStop(0, 'rgba(61, 196, 90, 0.7)');
        green.addColorStop(0.5, 'rgba(61, 196, 90, 0.3)');
        green.addColorStop(1, 'rgba(61, 196, 90, 0)');

        let cyan = ctx.createLinearGradient(0, 0, 0, 450);
        cyan.addColorStop(0, 'rgba(0, 255, 255, 0.7)');
        cyan.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
        cyan.addColorStop(1, 'rgba(0, 255, 255, 0)');
        let magenta = ctx.createLinearGradient(0, 0, 0, 450);
        magenta.addColorStop(0, 'rgba(255, 0, 255, 0.7)');
        magenta.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
        magenta.addColorStop(1, 'rgba(255, 0, 255, 0)');
        let yellow = ctx.createLinearGradient(0, 0, 0, 450);
        yellow.addColorStop(0, 'rgba(255, 255, 0, 0.7)');
        yellow.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
        yellow.addColorStop(1, 'rgba(255, 255, 0, 0)');
        let black = ctx.createLinearGradient(0, 0, 0, 450);
        black.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        black.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
        black.addColorStop(1, 'rgba(0, 0, 0, 0)');
        let white = ctx.createLinearGradient(0, 0, 0, 450);
        white.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        white.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        white.addColorStop(1, 'rgba(255, 255, 255, 0)');

        colors.push([green, 'rgb(58, 204, 43)'])
        colors.push([red, 'rgb(228, 63, 63)'])
        CMYKcolors.push([cyan, , 'rgb(0, 255, 255)'])
        CMYKcolors.push([magenta, 'rgb(255, 0, 255)'])
        CMYKcolors.push([yellow, 'rgb(255, 255, 0)'])
        CMYKcolors.push([black, 'rgb(0, 0, 0)'])
        CMYKcolors.push([white, 'rgb(255, 255, 255)'])


        let readyDataSet = []
        let size = Object.keys(dataset).length
        for (const[index, [key, value]] of Object.entries(Object.entries(dataset))){
            let color
            if (size <= 2){
                color = colors
            }else{
                color = CMYKcolors
            }
            data = {
                label: label[key],
                data: value,
                tension: 0.2,
                borderWidth: 2,
                backgroundColor: color[index][0],
                pointBackgroundColor: 'white',
                borderColor: color[index][1],
                fill: true,
            }
            readyDataSet.push(data)
        };

        this.myChart = new Chart(ctx, {
            type: 'line',
        data: {
            labels: labels,
            datasets: readyDataSet
            // datasets: [
            //     {
            //         label: label1,
            //         data: Squaremeter,
            //         tension: 0.2,
            //         borderWidth: 2,
            //         backgroundColor: gradientM2,
            //         pointBackgroundColor: 'white',
            //         borderColor: 'rgb(61, 196, 90)',
            //         fill: true,
            //     },
            //     {
            //         label: label2,
            //         data: Total_Ink,
            //         tension: 0.2,
            //         borderWidth: 2,
            //         backgroundColor: gradientMl,
            //         pointBackgroundColor: 'white',
            //         borderColor: 'rgb(215, 72, 72)',
            //         fill: true,
            //     },
            // ]
        },
        options: {
            maintainAspectRatio: 2,
            responsive: true,
            plugins: {
            title: {
                display: true,
                text: unit,
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


