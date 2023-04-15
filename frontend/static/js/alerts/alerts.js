/* Alerts */
let close = document.querySelectorAll('[data-close="alert"]');
for (let i = 0; i < close.length; i++) {
    close[i].onclick = function(){
        let div = this.parentElement;
        div.style.opacity = '0';
        setTimeout(function(){div.style.visibility = 'hidden';}, 400);
    }
}