import { alerts } from "./alerts/alerts.js";
import { callApiPut, callApiGet } from "./endpoints.js";
import { navigateTo } from "./index.js";

export function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

export function uniqueSortedList(data, label){
    let units = []
    data.forEach(element => {
        if (element.hasOwnProperty('name')){
            units.push(element.name)
        }
        else if(element.hasOwnProperty('unit')){
            units.push(element.unit)
        }
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


export async function generateNewChart(chart){
    
    let period = document.querySelector('#sBtn-text-Okres').innerText
    if (period == '-'){
        period = 'all'
        document.querySelector('#sBtn-text-Okres').innerText = 'all'
    }
    let path = localStorage.getItem("activeChartData");
    let unit = localStorage.getItem('activeUnit')
    let [status, data] = await callApiGet(path+`/${period}`)
    chart.createChart(unit, data)
}


export function getTwoColors(ctx){
    let colors = []
    let red = ctx.createLinearGradient(0, 0, 0, 450);
    red.addColorStop(0, 'rgba(215, 72, 72, 0.7)');
    red.addColorStop(0.5, 'rgba(215, 72, 72, 0.3)');
    red.addColorStop(1, 'rgba(215, 72, 72, 0)');
    let green = ctx.createLinearGradient(0, 0, 0, 450);
    green.addColorStop(0, 'rgba(61, 196, 90, 0.7)');
    green.addColorStop(0.5, 'rgba(61, 196, 90, 0.3)');
    green.addColorStop(1, 'rgba(61, 196, 90, 0)');

    colors.push([green, 'rgb(58, 204, 43)'])
    colors.push([red, 'rgb(228, 63, 63)'])
    return colors
}

export function getManyColors(ctx){
    let CMYKcolors = []
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

    CMYKcolors.push([cyan, 'rgb(0, 255, 255)'])
    CMYKcolors.push([magenta, 'rgb(255, 0, 255)'])
    CMYKcolors.push([yellow, 'rgb(255, 255, 0)'])
    CMYKcolors.push([black, 'rgb(0, 0, 0)'])
    CMYKcolors.push([white, 'rgb(255, 255, 255)'])
    return CMYKcolors
}