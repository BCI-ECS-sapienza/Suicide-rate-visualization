const widthLineChart = document.getElementById('lineChart').offsetWidth;
const heightLineChart = document.getElementById('lineChart').offsetHeight;

function createDictionary(country, aggregate){
    let res = '{"key": "' + country + '",';
    let year = 1985;
    let lastYear = 0;
    
    for( let el in aggregate){
        lastYear = aggregate[el].key;
        while((aggregate[el].key != year) || (year == 2017)){
            if(year == 2016){
                res = res + '"' + year +'": ' + 0;
            }
            else{
                res = res + '"' + year +'": ' + 0 + ', ';
            }
            year++;
        }
        if(aggregate[el].key == year){
            if(year == 2016)
                res = res + '"' + year + '": ' + aggregate[el].value.suicides_pop;
            else
                res = res + '"' + year + '": ' + aggregate[el].value.suicides_pop + ', ';
        }
        else{
            if(year == 2016)
                res = res + '"' + year +'": ' + 0;
            else
                res = res + '"' + year +'": ' + 0 + ', ';
        }
        year++;
    }
    if(lastYear < 2016){
        while(lastYear < 2016){
            if(year == 2016)
                res = res + '"' + year +'": ' + 0;
            else
                res = res + '"' + year +'": ' + 0 + ', ';
            lastYear++;
        }
    }
    res = res + '}';
    return res;
}

function makeLineChart(){
    const data = controller.dataAll;
    
    let dataLine = [];
    
    for( let i = 0; i<controller.selectedCountries.length; i++){
        const country = controller.selectedCountries[i].id;
        const dataFiltered = data.filter(d => d.country == country);
        if(dataFiltered.length > 0){
            
            const aggregate = aggregateDataByYearLineChart(dataFiltered);
            
            let json_parse = JSON.parse(createDictionary(country, aggregate));

            dataLine.push(json_parse);
        }        
        else{
            dataLine.push({
                'key': controller.selectedCountries[i].id,
                '1985': 0,
                '1986': 0,
                '1987': 0,
                '1988': 0,
                '1989': 0,
                '1990': 0,
                '1991': 0,
                '1992': 0,
                '1993': 0,
                '1994': 0,
                '1995': 0,
                '1996': 0,
                '1997': 0,
                '1998': 0,
                '1999': 0,
                '2000': 0,
                '2001': 0,
                '2002': 0,
                '2003': 0,
                '2004': 0,
                '2005': 0,
                '2006': 0,
                '2007': 0,
                '2008': 0,
                '2009': 0,
                '2010': 0,
                '2011': 0,
                '2012': 0,
                '2013': 0,
                '2014': 0,
                '2015': 0,
                '2016': 0
            });
        }
    }
}

