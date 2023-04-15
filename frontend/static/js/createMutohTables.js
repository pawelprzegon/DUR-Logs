import { navigateTo } from "./index.js";
import {callApiPut} from "./endpoints.js"


export class createTablesMutoh{
    constructor(data, target){
        this.data = data;
        this.target = target
        this.result = []
    }

    createTables(){
        let tbodys = this.createTbody();
        for (const[key, value] of Object.entries(tbodys)){
            let theads = this.createThead();
            let tableBox = document.createElement('div');
            tableBox.classList.add('tableBox');
            let tableLabel = document.createElement('h3')
            tableLabel.innerText = this.createLabel(key);
            let table = document.createElement('table');
            table.appendChild(theads);
            table.appendChild(value);
            tableBox.appendChild(tableLabel);
            tableBox.appendChild(table);
            this.result.push(tableBox);
        }
    }

    createLabel(element){
        switch (element){
            case 'unused':
                return 'Urządzenia zutylizowane'
            case 'inuse':
                return 'Urządzenia w produkcji' 
        }
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
        let tbodyUnused = document.createElement('tbody')
        let tbodyInUse = document.createElement('tbody')
        this.data.forEach(unit =>{
            let tr = document.createElement('tr');
            let inUse;
            for(const [key, value] of Object.entries(unit)){
                let each = document.createElement('td');
                each.classList.add('table-td');
                if (key == 'name'){
                    each.innerText = value;
                }else{
                    each.innerText = value;
                }
                tr.appendChild(each);
                if (key == 'lst_date'){
                    let date = new Date();
                    if(Date.parse(value) < date.setDate(date.getDate() - 7)){
                        inUse = false;
                    };
                }else if(key == 'suma_m2' && value >= this.target){
                    tr.classList.add('target-reached')
                }
                
            };
            if (inUse == false){
                tbodyUnused.appendChild(tr);
            }else{
                tbodyInUse.appendChild(tr);
            }
            
            
        });
        return {'unused': tbodyUnused, 'inuse': tbodyInUse}
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
}