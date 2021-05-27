function makeScatterPlot(colorScale) {
    const dataAll = aggregateDataByCountry(controller.dataAll);
    const dataFiltered = aggregateDataByCountry(controller.dataFiltered);
    
    // set params
    const country = d => d.key
    const xValue = d => d.value.gdp_for_year;
    const yValue = d => d.value.gdp_per_capita;
    const colorValue = d => d.value.suicides_pop;

    // callbacks for circles interactions
    const onPoint = function (d) {
        // highlight circle
        d3.select(this)
            .style("cursor", "pointer")
            .attr("class", "over-object")
            .attr("r", scatter_selected_circle_size )
    
        // highlight state on map
        d3.select('#map-holder').select('#'+country(d))
            .style("fill", 'lightblue')
            .style("stroke", "black");
    
        const gdp_year = d3.format('.2s')(xValue(d)).replace('G', 'B');
        const gdp_capita = d3.format('.2s')(yValue(d)).replace('G', 'B');
        
        // show tooltip
        tooltipScatter
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + country(d) + 
                '<br><b>GDP for year:' + avg_show + '</b> ' + gdp_year + 
                '<br><b>Gdp per capita:' + avg_show + '</b> '  + gdp_capita + 
                "<br><b>Suicide ratio:</b> " + d.value.suicides_pop)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
            .style("top", (d3.mouse(this)[1]) + "px")
    }

    const moveOverPoint = function (d) {
        const gdp_year = d3.format('.2s')(xValue(d)).replace('G', 'B');
        const gdp_capita = d3.format('.2s')(yValue(d)).replace('G', 'B');
        
        // show tooltip
        tooltipScatter
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + country(d) + 
                '<br><b>GDP for year:' + avg_show + '</b> ' + gdp_year + 
                '<br><b>Gdp per capita:' + avg_show + '</b> '  + gdp_capita + 
                "<br><b>Suicide ratio:</b> " + d.value.suicides_pop)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    
    const leavePoint = function(d){	
        d3.select(this)
            .attr("r", scatter_circle_size )
            .attr("class", "not-over-object");
    
        d3.select('#map-holder').select('#'+country(d))
        .style("stroke", "transparent")
        .style("fill", (d)=>{
            if(d.total === "Missing data") 
                return '#DCDCDC';
            else{
                return colorScale(d.total);
            }
        });
    
        tooltipScatter
            .style("opacity", 0)
    }



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
        .transition()
        .duration(scatter_transition_time)
        .attr("transform", "translate(0," + height_scatterPlot + ")") //to put on bottom
        .call(xAxis)
            .selectAll("text")  //text color
                .attr("class","axis-text");

    // add Y axis
    svgScatterPlot.append("g")
        .transition()
        .duration(scatter_transition_time)
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");


    // add Grid veritcal
    svgScatterPlot.append('g')
        .transition()
        .duration(scatter_transition_time)
        .attr('class', 'grid-scatter') //background color
        .attr('transform', `translate(0, ${height_scatterPlot})`)
        .call(d3.axisBottom()
            .scale(xScale)
            .tickSize(-height_scatterPlot, 0, 0)
            .tickFormat(''))

    // add Grid oriziontal
    svgScatterPlot.append('g')
        .transition()
        .duration(scatter_transition_time)
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
            .on("mouseover", onPoint)
            .on("mousemove", moveOverPoint)
            .on("mouseout", leavePoint)
            .attr('class', 'scatter-points') 
            .attr('id', (d) => country(d))
            .style("fill", (d) => colorScale(colorValue(d)))
            .transition()
            .duration(scatter_transition_time)
            .attr("cx", (d) => xScale(xValue(d)))
            .attr("cy", (d) => yScale(yValue(d)))
            .attr("r", scatter_circle_size)
            .style("opacity", 1)
            


    // add avg line for y
    const avg_value_y = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length);
    const avg_value_scaled_y = yScale(avg_value_y)
    svgScatterPlot.append("line")
        .transition()
        .duration(scatter_transition_time)
        .attr('class', 'avg-line')
        .attr("x1", 0)
        .attr("x2", width_scatterPlot+2)
        .attr("y1", avg_value_scaled_y)
        .attr("y2", avg_value_scaled_y)
  
    // avg value print for y
    svgScatterPlot.append("text")
        .transition()
        .duration(scatter_transition_time)
        .attr('class', 'avg-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width_scatterPlot-20}, ${avg_value_scaled_y-10})`) 
        .text(d3.format('.2s')(avg_value_y))

    // add avg line for x
    const avg_value_x = Math.round((d3.sum(dataFiltered, (d) => xValue(d))) / dataFiltered.length);
    const avg_value_scaled_x = xScale(avg_value_x)
    svgScatterPlot.append("line")
        .transition()
        .duration(scatter_transition_time)
        .attr('class', 'avg-line')
        .attr("x1", avg_value_scaled_x)
        .attr("x2", avg_value_scaled_x)
        .attr("y1", 0)
        .attr("y2", height_scatterPlot+2)
  
    // avg value print for x
    svgScatterPlot.append("text")
        .transition()
        .duration(scatter_transition_time)
        .attr('class', 'avg-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${avg_value_scaled_x+25}, ${20})`) 
        .text(d3.format('.2s')(avg_value_x).replace('G', 'B'))

}




  
// update data graph
controller.addListener('yearChanged', function (e) {

    //makeScatterPlot.onPoint()
});

