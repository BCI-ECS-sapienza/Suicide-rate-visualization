const initial_width_LineChart = document.getElementById('pca').offsetWidth;
const initial_height_LineChart = document.getElementById('pca').offsetHeight;

// set the dimensions and margins of the graph
const margin_LineChart = {top: 25, right: 30, bottom: 55, left: 105},
    width_LineChart = initial_width_LineChart - margin_LineChart.left - margin_LineChart.right,
    height_LineChart = initial_height_LineChart - margin_LineChart.top - margin_LineChart.bottom;

const lineChart_xLabel = 'Years';
let lineChart_yLabel = 'GDP per capita';

let is_gdp_per_capita = true;

// append the svg object to the body of the page
var svgLine = d3.select("#lineChart")
    .append("svg")
    //.attr('opacity', 0)
    .attr("width", initial_width_LineChart)
    .attr("height", initial_height_LineChart)
    .append("g")
        .attr("transform", "translate(" + margin_scatterPlot.left + "," + margin_scatterPlot.top + ")");

// set scales ranges 
const xScaleLineChart = d3.scaleLinear() 
.range([ 0, width_LineChart])

const yScaleLineChart = d3.scaleLinear()
    .range([ height_LineChart, 0])
    .nice();

// set compute axis domain   
const domain_min_x = 1985;
const domain_max_x = 2016;
const domain_min_y = 0;

// add label left
const lineChart_left_label_x = ((margin_LineChart.left/2) + 3) ;
const lineChart_left_label_y = (height_LineChart/2);

svgLine.append('text')
    .attr('class', 'axis-label')
    .attr('id', 'yLabel')
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
const lineChartXGridSvg = svgLine.append('g').attr('class', 'grid-lineChart');
const lineChartYGridSvg = svgLine.append('g').attr('class', 'grid-lineChart');

// set tooltips
const tooltipLine = d3.select("#lineChart")
    .append("div")
    .style("left", widthMap + initial_width_legend + "px")   
    .style("top",  heightMap + "px") //heightMap + "px")
    .style("opacity", 0)
    .attr("class", "tooltip")

function makeLineChart(){
    svgLine
        .selectAll('.dot')
        .remove()
        .exit();
    svgLine
        .selectAll('.line-path')
        .remove()
        .exit();
    svgLine
        .selectAll('#yLabel')
        .remove()
        .exit();

    
    if(is_gdp_per_capita){
        lineChart_yLabel = 'GDP per capita';
        svgLine.append('text')
            .attr('class', 'axis-label')
            .attr('id', 'yLabel')
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-lineChart_left_label_x}, ${lineChart_left_label_y}), rotate(-90)`) 
            .text(lineChart_yLabel)
    }
    else{
        lineChart_yLabel = 'GDP for year';
        svgLine.append('text')
            .attr('class', 'axis-label')
            .attr('id', 'yLabel')
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-lineChart_left_label_x}, ${lineChart_left_label_y}), rotate(-90)`) 
            .text(lineChart_yLabel)
    }
    const data = getLineChartData();

    // iterators 
    const capita_iterator = d => d.value.gdp_per_capita;
    const year_iterator = d => d.value.gdp_for_year;

    // compute and set domain_max_y for y Axis
    const yData = controller.dataLineChart;
    const scale = [0, 0, 0];
    
    let domain_max_y = 0;
    let max_val_aggregate_y = 0;

    for( let i = 0; i<controller.selectedCountries.length; i++){
        const country = controller.selectedCountries[i].id;
        const dataFiltered = yData.filter(d => d.country == country);
        
        if(dataFiltered.length > 0){
            const aggregate = aggregateDataByYearLineChart(dataFiltered);
            if(is_gdp_per_capita)
                max_val_aggregate_y = d3.max(aggregate, capita_iterator);
            else
                max_val_aggregate_y = d3.max(aggregate, year_iterator);
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
    xScaleLineChart.domain([domain_min_x, domain_max_x ]);
    yScaleLineChart.domain([domain_min_y, domain_max_y ]);

    // axis setup
    const customTickFormat = number => {
        return "'" + number.toString().substr(-2);
    } 
    const xAxis = d3.axisBottom(xScaleLineChart).tickFormat(customTickFormat);
    const yAxis = d3.axisLeft(yScaleLineChart).tickFormat(AxisTickFormat);


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

    
    for(let el in data){
        let country_points = [];

        for(let year in data[el]){
            
            if(!isNaN(year)){
                if(is_gdp_per_capita)
                    country_points.push({x: xScaleLineChart(year), y: yScaleLineChart(data[el][year].gdp_per_capita)})
                else
                    country_points.push({x: xScaleLineChart(year), y: yScaleLineChart(data[el][year].gdp_for_year)})
            }
            
        }
        if(country_points.length != 0)
            drawLine(country_points, data[el].key);
    }
    for(let el in data){

        for(let year in data[el]){
            if(!isNaN(year)){
                if(is_gdp_per_capita)
                    drawPoint(year, data[el][year].gdp_per_capita, data[el].key, data[el][year].suicides_pop);
                else
                    drawPoint(year, data[el][year].gdp_for_year, data[el].key, data[el][year].suicides_pop);
            }
            
        }
    }
}

function manageData(country, aggregate){
    let dict = {};
    dict['key'] = country;

    for(let el in aggregate){
        let year = aggregate[el].key;
        let inner_dict = {};
        inner_dict['suicides_pop'] = aggregate[el].value.suicides_pop;
        inner_dict['gdp_per_capita'] = aggregate[el].value.gdp_per_capita;
        inner_dict['gdp_for_year'] = aggregate[el].value.gdp_for_year;
        dict[year] = inner_dict;
    }
    //console.log(dict);
    return dict;
}

function getLineChartData(){
    const data = controller.dataLineChart;
    
    let dataLine = [];
    
    for( let i = 0; i<controller.selectedCountries.length; i++){
        const country = controller.selectedCountries[i].id;
        const dataFiltered = data.filter(d => d.country == country);
        
        if(dataFiltered.length > 0){
            
            const aggregate = aggregateDataByYearLineChart(dataFiltered);
            
            let managed_data = manageData(country, aggregate);
            
            dataLine.push(managed_data);
        }        
        
    }
    return dataLine;
}

function drawPoint(year, value, country, suicides){
    let colorScale = controller.colorScale;

    // if no filter applied then show avg in tooltip
    let avg_show_line = " (avg.)"
    if (controller.isYearFiltered == true) 
        avg_show_line = ""
    
    svgLine
        //.append("g")
        .append("circle")
            .attr('id', country)
            .attr('class', 'dot')
            .attr("cx", xScaleLineChart(year))
            .attr("cy", yScaleLineChart(value))
            .attr("r", 5)
            .style("fill", colorScale(suicides))
            .on('mouseover', function(d){
                const gdp = d3.format('.2s')(value).replace('G', 'B');
                
                tooltipLine
                    .transition()
                    .duration(controller.transitionTime/2);
                    
                // show tooltip
                tooltipLine
                    .style("opacity", 1)
                    .html(
                        '<b>Country:</b> ' + country + 
                        `<br><b>GDP: ${avg_show_line} </b> ${gdp}` + 
                        `<br><b>Suicide ratio:</b> ${suicides}`)
                    .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")    
                    .style("top", (d3.mouse(this)[1]) + vertical_margin + "px");
            })
            .on('mouseout', function(d){
                tooltipLine
                    .style("opacity", 0)
            })
            .on('mousemove', function(d){
                const gdp = d3.format('.2s')(value).replace('G', 'B');
                // show tooltip
                tooltipLine
                    .style("opacity", 1)
                    .html(
                        '<b>Country:</b> ' + country + 
                        `<br><b>GDP: ${avg_show_line} </b> ${gdp}` + 
                        `<br><b>Suicide ratio:</b> ${suicides}`)
                    .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")    
                    .style("top", (d3.mouse(this)[1]) + vertical_margin + "px");
            })
            //.style('stroke', svgRadar.select(`#${country}`).style('fill'))
            .attr('stroke-width', 1.5);
            //.attr("fill", "#69b3a2");
      
}

function drawLine(points, country){
    svgLine.append("path")
        .attr('id', country+'-line')
        .attr('class', 'line-path')
        .datum(points)
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return d.x })
          .y(function(d) { return d.y })
          )
        .style("fill", "none");
        //.style('stroke', svgRadar.select(`#${country}`).style('fill'));;
        

}

const changeGDP = () => {
    is_gdp_per_capita = !is_gdp_per_capita;
    makeLineChart();
    drawRadar();
}