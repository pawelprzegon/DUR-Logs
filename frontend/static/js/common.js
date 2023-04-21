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
    return setTimeout(() => {
    document.getElementById('loading').style.visibility = 'hidden';
    document.getElementById('loading').style.display = 'none';
    }, 500);
  }

export function showloader() {
  return setTimeout(() => {
      document.getElementById('loading').style.visibility = 'visible';
      document.getElementById('loading').style.display = '';
    }, 500);
}

export class Replacement{
    constructor(description, btnLabel, plchold, path){
        this.removeReplacement();
        this.description = description
        this.btnLabel = btnLabel;
        this.plchold = plchold;
        this.path = path;
        this.settingsBox = document.createElement('div');

        this.changeInputBox = document.createElement('div');
        this.form = document.createElement('form');
        this.submit = document.createElement('input');
    }

    removeReplacement(){
        if (document.querySelector('.settingsBox')){
            document.querySelector('.settingsBtn').innerHTML=''
            document.querySelector('.settingsBox').innerHTML=''
        }
    }

    impalaReplacements(){
        let dateInput = document.createElement('input')
        dateInput.type = 'text'
        dateInput.classList.add('changeInput');
        dateInput.placeholder = this.plchold //'data...';
        dateInput.setAttribute('data-toggle', 'datepicker')
        
        this.submit.classList.add('settingsBtn');
        this.submit.type = 'submit';
        this.submit.value = 'zapisz';
        this.form.onsubmit = async (event) => {
            event.preventDefault();
            let selected = document.querySelector('.selected-to-replace')
            selected = selected.id.split('-')
            this.deactivate();
            
            let what = selected[0];
            let replaceDate = dateInput.value;
            let unit = selected[1];
            let color = null;
            if (selected.length > 2){
                color = selected[2];
            }
            let [response, status] = await callApiPut(`impalas/replacements/${what}&${replaceDate}&${unit}&${color}`);
            console.log(status, response);
            navigateTo(this.path);
        }
        this.changeInputBox.appendChild(dateInput);
        this.pack();
    }

    mutohTarget(){
        let changeInput = document.createElement('input');
        changeInput.type = 'text';
        changeInput.classList.add('changeInput');
        changeInput.placeholder = this.plchold //'wprowadź wartość...';
        let validNumberLabel = document.createElement('small');
        validNumberLabel.id = 'validNumberLabel';
        this.submit.classList.add('settingsBtn');
        this.submit.type = 'submit';
        this.submit.value = 'zapisz';
        this.form.onsubmit = async (event) => {
            event.preventDefault();
            let validate = this.numberValidation(changeInput.value);
            if (validate == true){
                let [response, status] = await callApiPut('mutohs/target/'+changeInput.value);
                console.log(status, response);
                if(status == 200){
                    navigateTo(this.path);
                }
                else{
                    alerts(status, response.detail, 'alert-red')
                }
                
            }
        }
        this.changeInputBox.appendChild(changeInput);
        this.pack();
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

    options(){
        this.settingsBox.classList.add('settingsBox')
        this.settingsBox.style.visibility = "hidden";
    
        let changeLabel = document.createElement('p');
        changeLabel.innerText = this.description //'Wprowadź datę oraz zaznacz pozycję w tabeli:';
        
        this.changeInputBox.classList.add('changeInputBox');
        
        this.form.classList.add('changeForm');
        this.form.appendChild(changeLabel);

        let settingsBtnBox = document.createElement('div');
        settingsBtnBox.classList.add('settingsBtnBox');
        let settingsBtn = document.querySelector('.settingsBtn')
        settingsBtn.innerText = 'Dodaj wymianę';

        settingsBtn.onclick = () => {
            let settingsBox = document.querySelector('.settingsBox')
            if (settingsBox.style.visibility === 'hidden'){
                settingsBox.style.visibility = null;
                this.showDatePicker();
                this.activate();
            }else{
                settingsBox.style.visibility = 'hidden';
                this.deactivate();
            }
        }
        settingsBtnBox.appendChild(settingsBtn);
        return settingsBtnBox
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

    pack(){
        
        this.form.appendChild(this.changeInputBox)
        this.form.appendChild(this.submit)
        this.settingsBox.appendChild(this.form)
    }

    getReplaceBox(){
        return this.settingsBox;
    }
}
