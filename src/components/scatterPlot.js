const makeScatterPlot = () => {

    ////////////////////////// CALLBACK //////////////////////////

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
        
        tooltipScatter
            .transition()
            .duration(controller.transitionTime/2)
        
        // show tooltip
        tooltipScatter
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + country(d) + 
                `<br><b>GDP for year: ${avg_show} </b> ${gdp_year}` + 
                `<br><b>Gdp per capita: ${avg_show} </b> ${gdp_capita}` + 
                `<br><b>Suicide ratio:</b> ${d.value.suicides_pop}`)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
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
                `<br><b>GDP for year: ${avg_show} </b> ${gdp_year}` + 
                `<br><b>Gdp per capita: ${avg_show} </b> ${gdp_capita}` + 
                `<br><b>Suicide ratio:</b> ${d.value.suicides_pop}`)
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


    // brush callback
    const updateChart = () => {
        extent = d3.event.selection
        selectedPoints = []; // here we will have all the points in the selected region (or all the original points)

        // If no selection, back to initial coordinate. Otherwise, update domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);

            // update axis scale
            xScale.domain([0, domain_max_x ])
            yScale.domain([0, domain_max_y ])

            // back to all the original points for this year
            selectedPoints = aggregateDataByCountry(controller.dataYear);
            
            // update filter
            controller.isScatterFiltered = false;
            controller.triggerScatterFilterEvent(selectedPoints);

        } else {  
            // get back values in correct scale
            const x0 = xScale.invert(extent[0][0])
            const x1 = xScale.invert(extent[1][0])
            const y0 = yScale.invert(extent[1][1])
            const y1 = yScale.invert(extent[0][1])

            // update axis domain
            xScale.domain([ x0, x1 ])
            yScale.domain([ y0, y1 ])

            // get all the points in the region        
            dataFiltered.forEach(( point ) => {
                if (xValue(point) > x0 && xValue(point) < x1 && yValue(point) > y0 && yValue(point) < y1) 
                    selectedPoints.push(point);
            })

            // update filter
            controller.isScatterFiltered = true;
            controller.triggerScatterFilterEvent(selectedPoints);

            // to remove the grey brush area as soon as the selection has been done
            scatterArea.select(".brush").call(scatterBrush.move, null) 
        }

        // update axis 
        scatterXAxisSvg.transition().duration(1000).call(xAxis)
            .selectAll("text") 
                .attr("class","axis-text");

        scatterYAxisSvg.transition().duration(1000).call(yAxis)
            .selectAll("text") 
                .attr("class","axis-text");

        // update grid
        scatterXGridSvg
            .transition()
            .duration(controller.transitionTime)
            //.attr('transform', `translate(0, ${height_scatterPlot})`)
            .call(d3.axisBottom()
                .scale(xScale)
                .tickSize(-height_scatterPlot, 0, 0)
                .tickFormat(''))

        scatterYGridSvg 
            .transition()
            .duration(controller.transitionTime)
            .call(d3.axisLeft()
                .scale(yScale)
                .tickSize(-width_scatterPlot, 0, 0)
                .tickFormat(''))
            
        // update circles position
        scatterArea
            .selectAll("circle")
            .transition()
            .duration(controller.transitionTime)
            .attr("cx", (d) => xScale(xValue(d)))
            .attr("cy", (d) => yScale(yValue(d)))
            .attr("r", scatter_circle_size)
            .delay( (d,i) => i*5)

        // update position avg lines (values need rescale)
        const avg_value_scaled_y = yScale(avg_value_y)
        const avg_value_scaled_x = xScale(avg_value_x)
        svgScatterPlot.selectAll('.avg-line').remove()
        svgScatterPlot.selectAll('.avg-label').remove()
        printAvgY(svgScatterPlot, avg_value_y, avg_value_scaled_y, width_scatterPlot)
        printAvgX(svgScatterPlot, avg_value_x, avg_value_scaled_x, height_scatterPlot)

    }



    ////////////////////////// SETUP //////////////////////////
   
    // get data
    const dataFiltered = aggregateDataByCountry(controller.dataMapScatter);
    const colorScale = controller.colorScale;

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
    const max_val_filtered_x = d3.max(dataFiltered, xValue) 
    const domain_max_x = parseInt(max_val_filtered_x) + parseInt(max_val_filtered_x/100)

    // add some padding on top yAxis (1/100 more than max between dataAll and dataFiltered)
    const max_val_filtered_y = d3.max(dataFiltered, yValue) 
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
    const avg_value_y = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length *10) /10;
    const avg_value_scaled_y = yScale(avg_value_y)

    // compute avg line for x
    const avg_value_x = Math.round((d3.sum(dataFiltered, (d) => xValue(d))) / dataFiltered.length *10) /10;
    const avg_value_scaled_x = xScale(avg_value_x)

    // compute avg colorscale
    const avg_value_color = Math.round((d3.sum(dataFiltered, (d) => colorValue(d))) / dataFiltered.length *10) /10;
        
    // initialize brushing
    scatterBrush.on("end", updateChart) 



    ////////////////////////// CALL COMPONENTS //////////////////////////

    // call x Axis
    scatterXAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(xAxis)
            .selectAll("text")  //text color
                .attr("class","axis-text");

    // call Y axis
    scatterYAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

            
    // call Grid veritcal
    scatterXGridSvg
        .transition()
        .duration(controller.transitionTime/2)
        .attr('transform', `translate(0, ${height_scatterPlot})`)
        .call(d3.axisBottom()
            .scale(xScale)
            .tickSize(-height_scatterPlot, 0, 0)
            .tickFormat(''))

    // call Grid oriziontal
    scatterYGridSvg 
        .transition()
        .duration(controller.transitionTime/2)
        .call(d3.axisLeft()
            .scale(yScale)
            .tickSize(-width_scatterPlot, 0, 0)
            .tickFormat(''))


    // add circles
    scatterArea
        .append('g')
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
            .style("opacity", 1)
            .transition()
            .duration(controller.transitionTime/2)
            .attr("cx", (d) => xScale(xValue(d)))
            .attr("cy", (d) => yScale(yValue(d)))
            .attr("r", scatter_circle_size)
            .delay( (d,i) => (i*10))
          
            
    // add avg lines
    printAvgY(svgScatterPlot, avg_value_y, avg_value_scaled_y, width_scatterPlot)
    printAvgX(svgScatterPlot, avg_value_x, avg_value_scaled_x, height_scatterPlot)

    // update svg colorScale
    document.getElementById('avg-scatter').innerHTML = `&nbsp; Avg suicide/100k pop: ${avg_value_color}`
    
}



////////////////////////// HELP FUNCTIONS //////////////////////////

// toggle brush when press button
const toggleBrush = () => {
    if (scatter_toggle_brush ==  false) {
        // add brushing
        scatterArea
            .append("g")
                .attr("class", "brush")
                .call(scatterBrush);
        d3.select('#button-brush').classed('toggle-brush', true)

    } else {
        svgScatterPlot.select('.brush').remove()
        d3.select('#button-brush').classed('toggle-brush', false)
    }

    scatter_toggle_brush = !scatter_toggle_brush;
}



// update data on year changed
const updateScatterOut = () => {
    svgScatterPlot.selectAll('.scatter-points').remove()
    svgScatterPlot.selectAll('.avg-line').remove()
    svgScatterPlot.selectAll('.avg-label').remove()
    makeScatterPlot();
};




