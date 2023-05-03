import { alerts } from "./alerts/alerts.js";
import { callApiPut } from "./endpoints.js";
import { navigateTo } from "./index.js";

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

export function uniqueSortedList(data, label){
    let units = []
    data.forEach(element => {
        units.push(element.name)
    });

    let unique = units.filter(onlyUnique);
    if(label == 'Mutoh'){
        unique.sort();
        unique.reverse();
    }
    return unique
}

export async function hideloader() {
    document.getElementById('loading').style.visibility = 'hidden';
    document.getElementById('loading').style.display = 'none';
  }

export function showloader() {
//   return setTimeout(() => {
      document.getElementById('loading').style.visibility = 'visible';
      document.getElementById('loading').style.display = '';
    // }, 1000);
}

export function removeDbSettings(){
    let dbSettings = document.querySelectorAll('.DbSettings')
    if (dbSettings){
        dbSettings.forEach(element => {
            element.remove();
        });
    }
}




export class Replacement{
    constructor(description, btnLabel, plchold, path){
        this.description = description
        this.btnLabel = btnLabel;
        this.plchold = plchold;
        this.path = path;
        this.trigger = btnLabel.split(' ').slice(-1).pop()
        this.DbSettings = document.createElement('div');
        this.address = this.lastUrlSegment();
    }

    lastUrlSegment(){
        const parts = window.location.href.split('/');
        return parts.pop() || parts.pop(); 
    }


    callendarReplacement(){
        this.settingsBtn.onclick = () => {
            document.querySelectorAll(`.settingsBox:not(.${this.trigger})`).forEach(element => {
                element.style.display = 'none';
            });
            let settingsBox = document.querySelector(`.${this.trigger}`)
            if (settingsBox.style.display === 'none'){
                settingsBox.style.display = null;
                this.showDatePicker();
                this.activate();  
            }else{
                settingsBox.style.display = 'none';
                this.deactivate();
            }
        }

        this.form.onsubmit = async (event) => {
            event.preventDefault();
            let selected = document.querySelector('.selected-to-replace')
            selected = selected.id.split('-')
            this.deactivate();
            
            let what = selected[0];
            let replaceDate = this.changeInput.value;
            let unit = 'Impala '+selected[1];
            let color = null;
            if (selected.length > 2){
                color = selected[2];
            }
            let [response, status] = await callApiPut(`impala/replacements/${what}&${replaceDate}&${unit}&${color}`);
            console.log(status, response);
            if(status == 200){
                navigateTo(this.path);
            }
            else{
                alerts(status, response.detail, 'alert-red')
            }
        }
    }

    inputValue(apiPath){
        this.settingsBtn.onclick = () => {
            document.querySelectorAll(`.settingsBox:not(.${this.trigger})`).forEach(element => {
                element.style.display = 'none';
            });
            let settingsBox = document.querySelector(`.${this.trigger}`)
            if (settingsBox.style.display === 'none'){
                settingsBox.style.display = null;
                document.querySelector('.changeInput').focus();
            }else{
                settingsBox.style.display = 'none';  
            }
        }
        
        this.form.onsubmit = async (event) => {
            event.preventDefault();
            let validate = this.numberValidation(this.changeInput.value);
            if (validate == true){
                let [response, status] = await callApiPut(apiPath+this.changeInput.value);
                // console.log(status, response);
                if(status == 200){
                    navigateTo(this.path);
                }
                else{
                    alerts(status, response.detail, 'alert-red')
                }
            }
        }
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

    createBox(){
        this.DbSettings.classList.add('DbSettings')
        let button = this.createButton();
        let body = this.craeteBody();
        this.DbSettings.appendChild(button)
        this.DbSettings.appendChild(body)
    }

    createButton(){
        let settingsBtnBox = document.createElement('div');
        settingsBtnBox.classList.add('settingsBtnBox');
        this.settingsBtn = document.createElement('p');
        this.settingsBtn.classList.add('settingsBtn')
        this.settingsBtn.innerText = this.btnLabel;

       
        settingsBtnBox.appendChild(this.settingsBtn);
        return settingsBtnBox
    }

    craeteBody(){
        let settingsBox = document.createElement('div');
        settingsBox.classList.add('settingsBox', `${this.trigger}`)
        settingsBox.style.display = "none";
    
        let changeLabel = document.createElement('p');
        changeLabel.innerText = this.description;
          
        this.form = document.createElement('form');
        this.form.classList.add('changeForm');
        let changeInputBox = document.createElement('div');
        changeInputBox.classList.add('changeInputBox');
        
        this.changeInput = document.createElement('input');
        this.changeInput.type = 'text';
        this.changeInput.classList.add('changeInput');
        if (this.plchold === 'data'){this.changeInput.setAttribute('data-toggle', 'datepicker')}
        this.changeInput.placeholder = this.plchold;
        let validNumberLabel = document.createElement('small');
        validNumberLabel.id = 'validNumberLabel';

        let submit = document.createElement('input');
        submit.classList.add('settingsBtn');
        submit.type = 'submit';
        submit.value = 'zapisz';

        changeInputBox.appendChild(this.changeInput);
        changeInputBox.appendChild(validNumberLabel);
        this.form.appendChild(changeLabel);
        this.form.appendChild(changeInputBox)
        this.form.appendChild(submit)
        settingsBox.appendChild(this.form)

        return settingsBox
    }

    showDatePicker(){
        $('[data-toggle="datepicker"]').datepicker({
            format: 'yyyy-mm-dd',
            language: 'pl-PL'
        });
    }

    activate(){
        let clickableElements = document.querySelectorAll('.clickable');
        clickableElements.forEach(element => {
            element.classList.add('activ')
        });
    }

    deactivate(){
        let clickableElements = document.querySelectorAll('.activ');
        clickableElements.forEach(element => {
            element.classList.remove('activ');
        });
        let selected = document.querySelector('.selected-to-replace');
        if (selected){
            selected.classList.remove('selected-to-replace'); 
        }                      
        
    }

    getReplaceBox(){
        return this.DbSettings;
    }
}
