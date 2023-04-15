export function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

export function calculateChartSize(){
    let chartWidth = '500px'
    if ( $(window).width() <= 600) {     
      chartWidth = '450px'
    }
    else if (( $(window).width() > 600) && ( $(window).width() <= 900)){
      chartWidth = '550px'
    }else if (( $(window).width() > 900) && ( $(window).width() <= 1500)){
        chartWidth = '750px'
    }else{
      chartWidth = '900px'
    }
    return chartWidth
}