function makeScatterPlot(colorScale) {

    // callback for mouseover circles 
    const onPoint = function (d) {
        // highlight circle
        d3.select(this)
            .style("cursor", "pointer")
            .attr("r", scatter_selected_circle_size )
            .classed('over-object', true)
    
        // highlight state on map
        d3.select('#map-holder').select('#'+country(d))
            .classed('over-object', true)
            .style("fill", "rgb(131, 20, 131)");
    
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
            .style("top", (d3.mouse(this)[1]) + "px") //heightMap + "px")
    }

    // callback for mousemove circles 
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
            .style("top", (d3.mouse(this)[1]) + "px") //heightMap + "px")
    }
    
    // callback for mouseleave circles 
    const leavePoint = function(d){	
        // remove highlight circle
        d3.select(this)
            .attr("r", scatter_circle_size )
            .classed('over-object', false)
    
        // remove highlight state on map
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

    // needed for brush callback
    var idleTimeout
    const idled = () =>  idleTimeout = null; 
   
    // brush callback
    const updateChart = () => {
        extent = d3.event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
            xScale.domain([0, domain_max_x ])
            yScale.domain([0, domain_max_y ])
        } else{
            const x0 = xScale.invert(extent[0][0])
            const x1 = xScale.invert(extent[1][0])
            const y0 = yScale.invert(extent[1][1])
            const y1 = yScale.invert(extent[0][1])

            // TO ADD FILTER EVENT
            //const brushed = (d) => x0 <= xScale(xValue(d)) && xScale(xValue(d)) <= x1 && y0 <= yScale(yValue(d)) && yScale(yValue(d)) <= y1;
            //const brushedPoints = brushed();
            //console.log(brushedPoints)

            xScale.domain([ x0, x1 ])
            yScale.domain([ y0, y1 ])
            scatterArea.select(".brush").call(scatterBrush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // update axis 
        scatterXAxisSvg.transition().duration(1000).call(xAxis)
            .selectAll("text") 
                .attr("class","axis-text");

        scatterYAxisSvg.transition().duration(1000).call(yAxis)
            .selectAll("text") 
                .attr("class","axis-text");
        
        // update circles position
        scatterArea
            .selectAll("circle")
            .transition()
            .duration(scatter_transition_time)
            .attr("cx", (d) => xScale(xValue(d)))
            .attr("cy", (d) => yScale(yValue(d)))
            .attr("r", scatter_circle_size)
            .style("opacity", 1)

    }


   
    // get data
    const dataFiltered = aggregateDataByCountry(controller.dataFiltered);

    // set data iterators
    const country = d => d.key
    const xValue = d => d.value.gdp_for_year;
    const yValue = d => d.value.gdp_per_capita;
    const colorValue = d => d.value.suicides_pop;

     // if no filter applied then show avg in tooltip
     let avg_show = " (avg.)"
     if (controller.isYearFiltered == true) 
         avg_show = ""

    
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

    // set scales ranges
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

    // compute avg line for y
    const avg_value_y = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length);
    const avg_value_scaled_y = yScale(avg_value_y)

    // compute avg line for x
    const avg_value_x = Math.round((d3.sum(dataFiltered, (d) => xValue(d))) / dataFiltered.length);
    const avg_value_scaled_x = xScale(avg_value_x)

        
    // Add brushing
    const scatterBrush = d3.brush()                 
        .extent( [ [0,0], [width_scatterPlot,height_scatterPlot] ] )
        .on("end", updateChart) 


    // call x Axis
    scatterXAxisSvg.call(xAxis)
        .transition()
        .duration(scatter_transition_time)
            .selectAll("text")  //text color
                .attr("class","axis-text");

    // call Y axis
    scatterYAxisSvg.transition()
        .duration(scatter_transition_time)
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

            
    // add Grid veritcal
    scatterXGridSvg
        .transition()
        .duration(scatter_transition_time)
        .attr('class', 'grid-scatter') 
        .attr('transform', `translate(0, ${height_scatterPlot})`)
        .call(d3.axisBottom()
            .scale(xScale)
            .tickSize(-height_scatterPlot, 0, 0)
            .tickFormat(''))

    // add Grid oriziontal
    scatterYGridSvg 
        .transition()
        .duration(scatter_transition_time)
        .call(d3.axisLeft()
            .scale(yScale)
            .tickSize(-width_scatterPlot, 0, 0)
            .tickFormat(''))


    // add circles
    scatterArea
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


    // add brushing
    scatterArea
        .append("g")
            .attr("class", "brush")
            .call(scatterBrush);
                
    // add A=avg lines
    printAvgY(svgScatterPlot, avg_value_y, avg_value_scaled_y, width_scatterPlot)
    printAvgX(svgScatterPlot, avg_value_x, avg_value_scaled_x, height_scatterPlot)
}



  
// update data on year changed
controller.addListener('yearChanged', function (e) {
    svgScatterPlot.selectAll('.scatter-points').remove()
    svgScatterPlot.selectAll('.avg-line').remove()
    svgScatterPlot.selectAll('.avg-label').remove()
    makeScatterPlot(controller.colorScale);
});


