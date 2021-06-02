const widthLineChart = document.getElementById('lineChart').offsetWidth;
const heightLineChart = document.getElementById('lineChart').offsetHeight;

// this line is only to work on lineChart
//////////////////////////////////////////
//////////////////////////////////////////
//svgScatterPlot
    //.style('opacity', 0);
//////////////////////////////////////////
//////////////////////////////////////////

function makeLineChart(){
    const data = controller.dataAll;

    const aggregateData = aggregateDataByLineChart(data);
    
    for( let i = 0; i<controller.selectedCountries.length; i++){
        for( let key1 in aggregateData){
            
            if(aggregateData[key1].key == controller.selectedCountries[i].id){

                for( let key2 in aggregateData[key1].key){
                    // returns the array with all years for a country
                    // console.log(aggregateData[key1].values);
                    // returns one year for a country
                    // console.log(aggregateData[key1].values[key2]);
                    // returns the suicides_pop in an year for a country
                    // console.log(aggregateData[key1].values[key2].value.suicides_pop);                    
                }
            }
        }
    }
}

