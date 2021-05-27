// chart static params
const initial_width_scatterPlot = document.getElementById('scatterPlot').offsetWidth;
const initial_height_scatterPlot = document.getElementById('scatterPlot').offsetHeight;
const scatter_xLabel = 'GDP for year';;
const scatter_yLabel = 'GDP per capita';
const scatter_circle_size = 5;
const scatter_selected_circle_size = 10;

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

// add label left
const scatter_left_label_x = ((margin_scatterPlot.left/5) * 3) +3;
const scatter_left_label_y = (height_scatterPlot/2);
svgScatterPlot.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-scatter_left_label_x}, ${scatter_left_label_y}), rotate(-90)`) 
    .text(scatter_yLabel)

// add label bottom
const scatter_bottom_label_x = width_scatterPlot/2;
const scatter_bottom_label_y = height_scatterPlot + ((margin_scatterPlot.bottom/6)*5);
svgScatterPlot.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${scatter_bottom_label_x},${scatter_bottom_label_y})`) //to put on bottom
    .text(scatter_xLabel)

const tooltipScatter = d3.select("#scatterPlot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-scatter")
    


function makeScatterPlot(colorScale) {
    const dataAll = aggregateDataByCountry(controller.dataAll);
    const dataFiltered = aggregateDataByCountry(controller.dataFiltered);

    // set params
    const country = d => d.key
    const xValue = d => d.value.gdp_for_year;
    const yValue = d => d.value.gdp_per_capita;
    const colorValue = d => d.value.suicides_pop;


    // add some padding on top xAxis (1/100 more than max between dataAll and dataFiltered)
    //const max_val_year_x = d3.max(dataAll, xValue) 
    const max_val_filtered_x = d3.max(dataFiltered, xValue) 
    //const max_val_x = (max_val_year_x >  max_val_filtered_x) ? max_val_year_x : max_val_filtered_x;
    //const domain_max_x = parseInt(max_val_x) + parseInt(max_val_x/100) 
    const domain_max_x = parseInt(max_val_filtered_x) + parseInt(max_val_filtered_x/100)

    // add some padding on top yAxis (1/100 more than max between dataAll and dataFiltered)
    //const max_val_year_y = d3.max(dataAll, yValue) 
    const max_val_filtered_y = d3.max(dataFiltered, yValue) 
    //const max_val_y = (max_val_year_y >  max_val_filtered_y) ? max_val_year_y : max_val_filtered_y;
    //const domain_max_y = parseInt(max_val_y) + parseInt(max_val_y/100) 
    const domain_max_y = parseInt(max_val_filtered_y) + parseInt(max_val_filtered_y/100)

    // set scales
    const xScale = d3.scaleLinear()
        .domain([0, domain_max_x ])
        .range([ 0, width_scatterPlot ])

    const yScale = d3.scaleLinear()
        .domain([0, domain_max_y ])
        .range([ height_scatterPlot, 0])
        .nice();


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


    // add Grid veritcal
    svgScatterPlot.append('g')
        .attr('class', 'grid-scatter') //background color
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

    // if no filter applied then we show avg
    let avg_show = ""
    if (controller.isDataFiltered == false) 
        avg_show = " (avg.)"


    // add circles
    svgScatterPlot.append('g')
        .selectAll("circle")
        .data(dataFiltered)
        .enter()
        .append("circle")
            .attr('class', 'scatter-points') 
            .attr('id', (d) => country(d))
            .attr("cx", (d) => xScale(xValue(d)))
            .attr("cy", (d) => yScale(yValue(d)))
            .attr("r", scatter_circle_size)
            .style("fill", (d) => colorScale(colorValue(d)))
            .style("opacity", 1)
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .attr("class", "selected-circle")
                    .attr("r", scatter_selected_circle_size )

                const gdp_year = d3.format('.2s')(xValue(d)).replace('G', 'B');
                const gdp_capita = d3.format('.2s')(yValue(d)).replace('G', 'B');
                
                tooltipScatter
                    .style("opacity", 1)
                    .html(
                        '<b>Country:</b> ' + country(d) + 
                        '<br><b>GDP for year:' + avg_show + '</b> ' + gdp_year + 
                        '<br><b>Gdp per capita:' + avg_show + '</b> '  + gdp_capita + 
                        "<br><b>Suicide ratio:</b> " + d.value.suicides_pop)
                    .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
                    .style("top", (d3.mouse(this)[1]) + "px")
            })
            .on("mousemove", function (d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .attr("r", scatter_selected_circle_size)
                    .style("stroke", "gold");

                const gdp_year = d3.format('.2s')(xValue(d)).replace('G', 'B');
                const gdp_capita = d3.format('.2s')(yValue(d)).replace('G', 'B');
                
                tooltipScatter            
                    .style("opacity", 1)
                    .html(
                        '<b>Country:</b> ' + country(d) + 
                        '<br><b>GDP for year' + avg_show + ':</b> ' + gdp_year + 
                        '<br><b>Gdp per capita' + avg_show + '</b> ' + gdp_capita + 
                        '<br><b>Suicide ratio:</b> ' + d.value.suicides_pop)
                    .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
                    .style("top", (d3.mouse(this)[1]) + "px")

            })
            .on("mouseout", function(d){	
                d3.select(this)
                    .attr("r", scatter_circle_size )
                    .attr("class", "not-selected-circle");

                tooltipScatter
                    .style("opacity", 0)
            })


    // add avg line for y
    const avg_value_y = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length);
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
    const avg_value_x = Math.round((d3.sum(dataFiltered, (d) => xValue(d))) / dataFiltered.length);
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

  
// update data graph
controller.addListener('yearChanged', function (e) {
    svgScatterPlot.selectAll('.axis-text').remove()
    svgScatterPlot.selectAll('.tick').remove()
    svgScatterPlot.selectAll('.grid-scatter').remove()
    svgScatterPlot.selectAll('.scatter-points').remove()
    svgScatterPlot.selectAll('.avg-line').remove()
    svgScatterPlot.selectAll('.avg-label').remove()
    makeScatterPlot(controller.colorScale)
});

