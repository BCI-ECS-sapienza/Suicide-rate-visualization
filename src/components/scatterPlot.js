// Width and Height of the box
const initial_width_scatterPlot = document.getElementById('scatterPlot').offsetWidth;
const initial_height_scatterPlot = document.getElementById('scatterPlot').offsetHeight;

// set the dimensions and margins of the graph
const margin_scatterPlot = {top: 25, right: 25, bottom: 60, left: 80},
    width_scatterPlot = initial_width_scatterPlot - margin_scatterPlot.left - margin_scatterPlot.right,
    height_scatterPlot = initial_height_scatterPlot - margin_scatterPlot.top - margin_scatterPlot.bottom;

// append the svg object to the body of the page
const svgScatterPlot = d3.select("#scatterPlot")
    .append("svg")
      .attr("width", initial_width_scatterPlot)
      .attr("height", initial_height_scatterPlot)
    .append("g")
      .attr("transform", "translate(" + margin_scatterPlot.left + "," + margin_scatterPlot.top + ")");  //padding

const tooltipScatter = d3.select("#scatterPlot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-scatter")
    

function makeScatterPlot() {
    const dataYearLoaded = controller.getDataYear();
    const dataFilteredLoaded = controller.getDataFiltered();
    
    const dataYear = aggregateDataScatter(dataYearLoaded);
    const dataFiltered = aggregateDataScatter(dataFilteredLoaded);

    // set params
    const xValue = d => d.value.gdp_for_year;
    const yValue = d => d.value.gdp_per_capita;
    const colorValue = d => d.value.suicides_pop;
    const xLabel = 'GDP for year';;
    const yLabel = 'GDP per capita';
    const colorLabel = 'Suicide ratio'
    const colorArray = controller.suicideColorScale;
    const circle_size = 5;

    // add some padding on top xAxis (1/100 more than max between dataYear and dataFiltered)
    const max_val_year_x = d3.max(dataYear, xValue) 
    const max_val_filtered_x = d3.max(dataFiltered, xValue) 
    const max_val_x = (max_val_year_x >  max_val_filtered_x) ? max_val_year_x : max_val_filtered_x;
    const domain_max_x = parseInt(max_val_x) + parseInt(max_val_x/100) 

    // add some padding on top yAxis (1/100 more than max between dataYear and dataFiltered)
    const max_val_year_y = d3.max(dataYear, yValue) 
    const max_val_filtered_y = d3.max(dataFiltered, yValue) 
    const max_val_y = (max_val_year_y >  max_val_filtered_y) ? max_val_year_y : max_val_filtered_y;
    const domain_max_y = parseInt(max_val_y) + parseInt(max_val_y/100) 

    // set scales
    const xScale = d3.scaleLinear()
        .domain([0, domain_max_x ])
        .range([ 0, width_scatterPlot ])

    const yScale = d3.scaleLinear()
        .domain([0, domain_max_y ])
        .range([ height_scatterPlot, 0])
        .nice();

    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(dataFiltered,colorValue)])
        .range(colorArray);


    // axis setup
    const xAxis = d3.axisBottom(xScale).tickFormat(AxisTickFormat);
    const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);


    // add X axis
    svgScatterPlot.append("g")
        .attr("transform", "translate(0," + height_scatterPlot + ")") //to put on bottom
        .call(xAxis)
        .selectAll("text")  //text color
        .attr("class","axis-text");

    // add Y axis
    svgScatterPlot.append("g")
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

    // add label left
    const left_label_x = ((margin_scatterPlot.left/5) * 3) +3;
    const left_label_y = (height_scatterPlot/2);
    svgScatterPlot.append('text')
        .attr('class', 'axis-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-left_label_x}, ${left_label_y}), rotate(-90)`) 
        .text(yLabel)
   
    // add label bottom
    const bottom_label_x = width_scatterPlot/2;
    const bottom_label_y = height_scatterPlot + ((margin_scatterPlot.bottom/6)*5);
    svgScatterPlot.append('text')
        .attr('class', 'axis-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${bottom_label_x},${bottom_label_y})`) //to put on bottom
        .text(xLabel)

    // add Grid veritcal
    svgScatterPlot.append('g')
        .attr('class', 'grid-barchart') //background color
        .attr('transform', `translate(0, ${height_scatterPlot})`)
        .call(d3.axisBottom()
            .scale(xScale)
            .tickSize(-height_scatterPlot, 0, 0)
            .tickFormat(''))

    // add Grid oriziontal
    svgScatterPlot.append('g')
        .call(d3.axisLeft()
        .scale(yScale)
        .tickSize(-width_scatterPlot, 0, 0)
        .tickFormat(''))


    // add circles
    svgScatterPlot.append('g')
        .selectAll("circle")
        .data(dataFiltered)
        .enter()
        .append("circle")
            .attr("cx", (d) => xScale(d.value.gdp_for_year) )
            .attr("cy", (d) => yScale(d.value.gdp_per_capita))
            .attr("r", circle_size)
            .style("fill", (d) => colorScale(d.value.suicides_pop) )
            .style("opacity", 1)
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("cursor", "pointer");

                const gdp_year = d3.format('.2s')(d.value.gdp_for_year).replace('G', 'B');
                const gdp_capita = d3.format('.2s')(d.value.gdp_per_capita).replace('G', 'B');
                
                tooltipScatter
                    .style("opacity", 1)
                    .html(
                        '<b>Country:</b> ' + d.key + 
                        '<br><b>GDP for year:</b> ' + gdp_year + 
                        "<br><b>Gdp per capita:</b> " + gdp_capita + 
                        "<br><b>Suicide ratio:</b> " + d.value.suicides_pop)
                    .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
                    .style("top", (d3.mouse(this)[1]) + "px")
            })
            .on("mouseout", function(d){	
                tooltipScatter
                    .transition()
                    .style("opacity", 0)
            })


    // add avg line for y
    const avg_value_y = Math.round((d3.sum(dataFiltered, (d) => d.value.gdp_per_capita)) / dataFiltered.length);
    const avg_value_scaled_y = yScale(avg_value_y)
    svgScatterPlot.append("line")
        .attr('class', 'avg-line')
        .attr("x1", 0)
        .attr("x2", width_scatterPlot+2)
        .attr("y1", avg_value_scaled_y)
        .attr("y2", avg_value_scaled_y)
  
    // avg value print for y
    svgScatterPlot.append("text")
        .attr('class', 'avg-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width_scatterPlot-20}, ${avg_value_scaled_y-10})`) 
        .text(d3.format('.2s')(avg_value_y))

    // add avg line for x
    const avg_value_x = Math.round((d3.sum(dataFiltered, (d) => d.value.gdp_for_year)) / dataFiltered.length);
    const avg_value_scaled_x = xScale(avg_value_x)
    svgScatterPlot.append("line")
        .attr('class', 'avg-line')
        .attr("x1", avg_value_scaled_x)
        .attr("x2", avg_value_scaled_x)
        .attr("y1", 0)
        .attr("y2", height_scatterPlot+2)
  
    // avg value print for x
    svgScatterPlot.append("text")
        .attr('class', 'avg-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${avg_value_scaled_x+25}, ${20})`) 
        .text(d3.format('.2s')(avg_value_x).replace('G', 'B'))


}


// aggregate data by sex
const aggregateDataScatter = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.country)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
        gdp_for_year: d[0].gdp_for_year,    // same for each category
        gdp_per_capita: d[0].gdp_per_capita
      }))
    .entries(dataIn)
    return data;
};


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeScatterPlot();
});

