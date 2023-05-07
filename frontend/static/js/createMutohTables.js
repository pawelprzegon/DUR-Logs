import { navigateTo } from "./index.js";
import {callApiPut} from "./endpoints.js"
import { alerts } from "./alerts/alerts.js";


export class createTablesMutoh{
    constructor(data, target){
        this.data = data;
        this.target = target;
        this.result = [];
    }

    createTables(){
        let tbody = this.createTbody();
        let tableBox = document.createElement('div');
        tableBox.classList.add('tableBox');
        
        let tableThead = document.createElement('table');
        let tableTbody = document.createElement('table');
        let tableTbodyBox = document.createElement('div');
        tableTbodyBox.classList.add('tableTbodyBox');
        let thead = this.createThead();
        
        tableThead.appendChild(thead);
        tableTbody.appendChild(tbody);
        tableTbodyBox.appendChild(tableTbody);
        let tablesmallBox = document.createElement('div');
        tablesmallBox.classList.add('tablesmallBox');
        tablesmallBox.appendChild(tableThead);
        tablesmallBox.appendChild(tableTbodyBox);
        tableBox.appendChild(tablesmallBox); 
        tableBox.appendChild(this.descriptionsBox());

        this.result.push(tableBox);
    }


    createThead(){
        const heads = ['Nazwa', 'Serial number', '[m2]', '[ml]', 'data', 'Osiągnięty target [%]'];
        let thead = document.createElement('thead');
        thead.classList.add('thead');
        let tr = document.createElement('tr');
        heads.forEach(head =>{
            let each = document.createElement('th');
            each.classList.add('table-th');
            each.innerText = head;
            tr.appendChild(each);
            thead.appendChild(tr);
        })
        return thead
    }

    createTbody(){
        let tbody = document.createElement('tbody');
        tbody.classList.add('tbody');
        this.data.forEach(unit =>{
            let tr = document.createElement('tr');
            for(const [key, value] of Object.entries(unit)){
                let each = document.createElement('td');
                each.classList.add('table-td');
                each.innerText = value;
                if(key == 'name'){
                    each.classList.add('unit');
                    each.onclick = () => {
                        let unit = document.querySelector(`#unit${value.split(' ')[1]}`);
                        unit.click();
                    }
                }else if (key == 'lst_date'){
                    each.innerText = value.replace('T', ' ')
                    let date = new Date();
                    if(Date.parse(value) < date.setDate(date.getDate() - 7)){
                        tr.classList.add('unused');
                    };
                }else if(key == 'suma_m2' && value >= this.target){
                    tr.classList.add('target-reached');
                }else if (key == 'target_reached'){
                    each.innerText = '';
                    each.classList.add('progress-bar-box');
                    let [progressBarBox, progressLabel] = this.createProgressBar(value);
                    each.appendChild(progressBarBox);
                    each.appendChild(progressLabel);
                }
                tr.appendChild(each);
            };
            tbody.appendChild(tr);
        });
        
        return tbody
    }

    descriptionsBox(){
        let describBox = document.createElement('div')
        describBox.classList.add('descBox')
        let tableDescrib = document.createElement('small')
        tableDescrib.innerText = '*całkowity przebieg urządzeń'
        let tableTarget = document.createElement('small');
        tableTarget.innerText = `Aktualny target [m2]: ${this.target} m2`;
        describBox.appendChild(tableDescrib)
        describBox.appendChild(tableTarget)

        return describBox
    }

    options(){
        let settingsBtnBox = document.createElement('div');
        settingsBtnBox.classList.add('settingsBtnBox');
        let settingsBtn = document.querySelector('.settingsBtn')
        settingsBtn.innerText = 'Zmień target';
        settingsBtn.onclick = () => {
            let changeTargetBox = document.querySelector('.settingsBox')
            if (changeTargetBox.style.visibility === 'hidden'){
                changeTargetBox.style.visibility = null
                document.querySelector('.changeInput').focus();
            }else{
                changeTargetBox.style.visibility = 'hidden'
            }
        }
        settingsBtnBox.appendChild(settingsBtn);
        return settingsBtnBox
    }

    changeTarget(){
        if (document.querySelector('.settingsBox')){
            document.querySelector('.settingsBtnBox').remove();
            document.querySelector('.settingsBox').remove();
        }
        let settingsBox = document.createElement('div');
        settingsBox.classList.add('settingsBox');
        settingsBox.style.visibility = "hidden";
        
        let changeLabel = document.createElement('p');
        changeLabel.innerText = 'Wprowadź nowy target [m2]:';
        let changeInputBox = document.createElement('div');
        changeInputBox.classList.add('changeInputBox');
        let form = document.createElement('form');
        form.classList.add('changeForm');
        let changeInput = document.createElement('input');
        changeInput.type = 'text';
        changeInput.classList.add('changeInput');
        changeInput.placeholder = 'wprowadź wartość...';
        let validNumberLabel = document.createElement('small');
        validNumberLabel.id = 'validNumberLabel';
        let submit = document.createElement('input');
        submit.classList.add('settingsBtn');
        submit.type = 'submit';
        submit.value = 'zapisz';
        form.onsubmit = async (event) => {
            event.preventDefault();
            let validate = this.numberValidation(changeInput.value);
            if (validate == true){
                let [response, status] = await callApiPut('mutoh/target/'+changeInput.value);
                console.log(status, response);
                if(status == 200){
                    navigateTo('/mutoh');
                }
                else{
                    alerts(status, response.detail, 'alert-red')
                }
                
            }
        }
        
        form.appendChild(changeLabel);
        changeInputBox.appendChild(changeInput);
        changeInputBox.appendChild(validNumberLabel);
        form.appendChild(changeInputBox);
        form.appendChild(submit);
        settingsBox.appendChild(form);

        return settingsBox
        
        
    }

    numberValidation(number){
        let input = document.querySelector('.changeInput');
        if (isNaN(number)){
            document.querySelector('#validNumberLabel').innerText = 'wprowadzona wartość nie jest cyfrą';
            input.classList.add('invalidNumber');
            return false
        }else{
            document.querySelector('#validNumberLabel').innerText = '';
            input.classList.remove('invalidNumber');
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
        progress = Math.min(progress, 100); 
        obj.style.width = progress + "%";
      }
}