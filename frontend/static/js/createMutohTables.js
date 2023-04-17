import { navigateTo } from "./index.js";
import {callApiPut} from "./endpoints.js"


export class createTablesMutoh{
    constructor(data, target){
        this.data = data;
        this.target = target
        this.result = []
    }

    createTables(){
        let tbody = this.createTbody();
        let tableBox = document.createElement('div');
        tableBox.classList.add('tableBox');

        let thead = this.createThead();
        let table = document.createElement('table');
        table.appendChild(thead);
        table.appendChild(tbody);
        let tablesmallBox = document.createElement('div')
        tablesmallBox.classList.add('tablesmallBox')
        tablesmallBox.appendChild(table)
        tableBox.appendChild(tablesmallBox);

        this.result.push(tableBox);
    }


    createThead(){
        const heads = ['Nazwa', '[m2]', '[ml]', 'Ostatni druk', 'limit [%]'];
        let thead = document.createElement('thead')
        thead.classList.add('thead')
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
        tbody.classList.add('tbody')
        this.data.forEach(unit =>{
            let tr = document.createElement('tr');
            for(const [key, value] of Object.entries(unit)){
                let each = document.createElement('td');
                each.classList.add('table-td');
                each.innerText = value;
                if(key == 'name'){
                    each.classList.add('unit')
                    each.onclick = () => {
                        let unit = document.querySelector(`#unit${value.split(' ')[1]}`)
                        unit.click();
                    }
                }else if (key == 'lst_date'){
                    let date = new Date();
                    if(Date.parse(value) < date.setDate(date.getDate() - 7)){
                        tr.classList.add('unused')
                    };
                }else if(key == 'suma_m2' && value >= this.target){
                    tr.classList.add('target-reached')
                }else if (key == 'target_reached'){
                    each.innerText = '';
                    each.classList.add('progress-bar-box');
                    let [progressBarBox, progressLabel] = this.createProgressBar(value);
                    each.appendChild(progressBarBox);
                    each.appendChild(progressLabel);
                }
                tr.appendChild(each);
            };
            tbody.appendChild(tr)
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

    changeTarget(){
        
        let changeBox = document.createElement('div')
        changeBox.classList.add('changeTargetBox')
        let changeLabel = document.createElement('p')
        changeLabel.innerText = 'Wprowadź nowy limit [m2]:'
        let changeInputBox = document.createElement('div')
        changeInputBox.classList.add('changeInputBox')
        let form = document.createElement('form')
        form.classList.add('changeTargetForm')
        let changeInput = document.createElement('input')
        changeInput.type = 'text'
        changeInput.placeholder = 'wprowadź wartość...'
        changeInput.classList.add('changeInput')
        let validNumberLabel = document.createElement('small')
        validNumberLabel.id = 'validNumberLabel'
        let submit = document.createElement('input')
        submit.classList.add('changeTargetBtn')
        submit.type = 'submit'
        submit.value = 'zapisz'
        form.onsubmit = async (event) => {
            event.preventDefault();
            console.log('test')
            let validate = this.numberValidation(changeInput.value)
            if (validate == true){
                let [response, status] = await callApiPut('mutohs/target/'+changeInput.value)
                console.log(status, response)
                navigateTo('/mutoh')
            }
        }
        

        form.appendChild(changeLabel)
        changeInputBox.appendChild(changeInput)
        changeInputBox.appendChild(validNumberLabel)
        form.appendChild(changeInputBox)
        form.appendChild(submit)
        changeBox.appendChild(form)
        
        
        return changeBox
        
        
    }

    numberValidation(number){
        let input = document.querySelector('.changeInput')
        if (isNaN(number)){
            document.querySelector('#validNumberLabel').innerText = 'wprowadzona wartość nie jest cyfrą'
            input.classList.add('invalidNumber')
            return false
        }else{
            document.querySelector('#validNumberLabel').innerText = ''
            input.classList.remove('invalidNumber')
            return true
        }
    }

    getTables(){
        return this.result;
    }

    createProgressBar(value){
        let progressBarBox = document.createElement('div');
        progressBarBox.classList.add("progress-bar");
        let prograssBar = document.createElement('div');
        let progressLabel = document.createElement('small');
        progressLabel.classList.add('progress-label');
        progressLabel.innerText = value+'%';
        progressBarBox.appendChild(prograssBar);
        this.myTimer(prograssBar, value);
        return [progressBarBox, progressLabel]
    }

    myTimer(obj, value) {
        let progress = value;
        if (progress > 100) {
          progress = 100;
        } 
        obj.style.width = progress + "%";
      }
}