const initial_width_LineChart = document.getElementById('scatterPlot').offsetWidth;
const initial_height_LineChart = document.getElementById('scatterPlot').offsetHeight;

// set the dimensions and margins of the graph
const margin_LineChart = {top: 25, right: 30, bottom: 55, left: 80},
    width_LineChart = initial_width_LineChart - margin_LineChart.left - margin_LineChart.right,
    height_LineChart = initial_height_LineChart - margin_LineChart.top - margin_LineChart.bottom;

const lineChart_xLabel = 'Years';
const lineChart_yLabel = 'Suicides_pop';

// append the svg object to the body of the page
var svgLine = d3.select("#lineChart")
    .append("svg")
    //.attr('opacity', 0)
    .attr("width", initial_width_LineChart)
    .attr("height", initial_height_LineChart)
    .append("g")
        .attr("transform", "translate(" + margin_scatterPlot.left + "," + margin_scatterPlot.top + ")");

function makeLineChart(){

    //const data = getLineChartData();

    // set scales ranges 
    const xScaleLineChart = d3.scaleLinear() 
    .range([ 0, width_LineChart])

    const yScaleLineChart = d3.scaleLinear()
        .range([ height_LineChart, 0])
        .nice();

    // set and compute axis domain   
    const domain_min_x = 1985;
    const domain_max_x = 2016;
    const domain_min_y = 0;


    const yData = controller.dataAll;
    const scale = [0, 0, 0];
    const yValueScatter = d => d.value.suicides_pop;
    let domain_max_y = 0;

    for( let i = 0; i<controller.selectedCountries.length; i++){
        const country = controller.selectedCountries[i].id;
        const dataFiltered = yData.filter(d => d.country == country);
        
        if(dataFiltered.length > 0){
            const aggregate = aggregateDataByYearLineChart(dataFiltered);
            const max_val_aggregate_y = d3.max(aggregate, yValueScatter)
            scale[i] = max_val_aggregate_y;
        }
    }

    domain_max_y = d3.max(scale); 
    
    if(domain_max_y < 30){
        domain_max_y = 30;
    }
    else{
        domain_max_y = parseInt(domain_max_y) + parseInt(domain_max_y/10)
    } 
    
    // set axis domain
    xScaleScatter.domain([domain_min_x, domain_max_x ]);
    yScaleScatter.domain([domain_min_y, domain_max_y ]);

    // axis setup
    const xAxis = d3.axisBottom(xScaleScatter).tickFormat(AxisTickFormat);
    const yAxis = d3.axisLeft(yScaleScatter).tickFormat(AxisTickFormat);

    // add label left
    const lineChart_left_label_x = ((margin_LineChart.left/5) * 3) +3;
    const lineChart_left_label_y = (height_LineChart/2);
    svgLine.append('text')
        .attr('class', 'axis-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-lineChart_left_label_x}, ${lineChart_left_label_y}), rotate(-90)`) 
        .text(lineChart_yLabel)


    // add label bottom
    const lineChart_bottom_label_x = width_LineChart/2;
    const lineChart_bottom_label_y = height_LineChart + ((margin_LineChart.bottom/6)*5);
    svgLine.append('text')
        .attr('class', 'axis-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${lineChart_bottom_label_x},${lineChart_bottom_label_y})`) //to put on bottom
        .text(lineChart_xLabel)

    // add X axis
    const lineChartXAxisSvg = svgLine.append("g")
    .attr("transform", "translate(0," + height_LineChart + ")"); //to put on bottom

    // add Y axis
    const lineChartYAxisSvg = svgLine.append("g");

    // add Grids
    const lineChartXGridSvg = svgLine.append('g').attr('class', 'grid-scatter');
    const lineChartYGridSvg = svgLine.append('g').attr('class', 'grid-scatter');


    // call x Axis
    lineChartXAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(xAxis)
            .selectAll("text")  //text color
                .attr("class","axis-text");

    // call Y axis
    lineChartYAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

            
    // call Grid veritcal
    lineChartXGridSvg
        .transition()
        .duration(controller.transitionTime/2)
        .attr('transform', `translate(0, ${height_LineChart})`)
        .call(d3.axisBottom()
            .scale(xScaleLineChart)
            .tickSize(-height_LineChart, 0, 0)
            .tickFormat(''))

    // call Grid oriziontal
    lineChartYGridSvg 
        .transition()
        .duration(controller.transitionTime/2)
        .call(d3.axisLeft()
            .scale(yScaleLineChart)
            .tickSize(-width_LineChart, 0, 0)
            .tickFormat(''))
}

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

function getLineChartData(){
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
    return dataLine;
}