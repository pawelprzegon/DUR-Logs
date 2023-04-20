export function alerts(status, response, alertType){
    
    let alert = document.getElementById('alert')
    clearClasses(alert, alertType)
    let alertMessage = document.getElementById('alert-message')
    alertMessage.innerHTML = `<strong> ${status} </strong> - ${response}`
    
    let sec = 8;
    let countDown = setInterval( async function() {
        document.getElementById("timer").innerHTML = sec+' ';
        sec--;
        if (sec == 0){
            clearInterval(countDown);
        }
    }, 1000)
    setTimeout(async function(){alert.style.visibility = 'hidden';}, 9000);
    
}

function clearClasses(alert, alertType){
    alert.style.removeProperty('opacity')
    alert.style.removeProperty('visibility')
    alert.className = '';
    alert.className = 'alert';
    alert.classList.add(alertType)
}