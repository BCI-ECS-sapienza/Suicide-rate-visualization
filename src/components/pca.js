const makePca = () => {

    // callback for mouseover circles 
    const onPoint = function (d) {
    
        const gdp_year = d3.format('.2s')(d.gdp_for_year).replace('G', 'B');
        const gdp_capita = d3.format('.2s')(d.gdp_per_capita).replace('G', 'B');  
        
        tooltipPca
            .transition()
            .duration(controller.transitionTime/2)
        
        // show tooltip
        tooltipPca
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + d.country + 
                '<br><b>Year:</b> ' + d.year +
                '<br><b>Sex:</b> ' + d.sex +
                '<br><b>Age:</b> ' + d.age +
                '<br><b>Suicides number:</b> ' + d.suicides_no +
                '<br><b>Population:</b> ' + d.population +
                '<br><b>suicides/pop:</b> ' + d.suicides_pop +
                `<br><b>GDP for year: </b> ${gdp_year}` + 
                `<br><b>Gdp per capita: </b> ${gdp_capita}` + 
                `<br><b>Suicide ratio:</b> ${d.suicides_pop}`)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")    
            .style("top", (d3.mouse(this)[1]) + "px") //heightMap + "px")
    }

    // callback for mousemove circles 
    const moveOverPoint = function (d) {
        const gdp_year = d3.format('.2s')(d.gdp_for_year).replace('G', 'B');
        const gdp_capita = d3.format('.2s')(d.gdp_per_capita).replace('G', 'B');  
        
        // show tooltip
        tooltipPca
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + d.country + 
                '<br><b>Year:</b> ' + d.year +
                '<br><b>Sex:</b> ' + d.sex +
                '<br><b>Age:</b> ' + d.age +
                '<br><b>Suicides number:</b> ' + d.suicides_no +
                '<br><b>Population:</b> ' + d.population +
                '<br><b>suicides/pop:</b> ' + d.suicides_pop +
                `<br><b>GDP for year: </b> ${gdp_year}` + 
                `<br><b>Gdp per capita: </b> ${gdp_capita}` + 
                `<br><b>Suicide ratio:</b> ${d.suicides_pop}`)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
            .style("top", (d3.mouse(this)[1])  + "px") //heightMap + "px")
    }
    
    // callback for mouseleave circles 
    const leavePoint = function(d){	
        tooltipPca
            .style("opacity", 0)
    }



    ////////////////////////// SETUP //////////////////////////
   
    // get data
    const dataFiltered = controller.dataYear; //!!!!!!!!!!!!!!!!!!!!!
    const colorScale = controller.colorScale;                          

    // set axis domain
    xScalePca.domain(d3.extent(dataFiltered, xValuePca))
    yScalePca.domain(d3.extent(dataFiltered, yValuePca))



    // axis setup
    const xAxis = d3.axisBottom(xScalePca).tickFormat(AxisTickFormat);
    const yAxis = d3.axisLeft(yScalePca).tickFormat(AxisTickFormat);

    // initialize brushing
    //pcaBrush.on("end", updateOnBrush) 



    ////////////////////////// CALL COMPONENTS //////////////////////////

    // call x Axis
    pcaXAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(xAxis)
            .selectAll("text")  //text color
                .attr("class","axis-text");

    // call Y axis
    pcaYAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

            
    // call Grid veritcal
    pcaXGridSvg
        .transition()
        .duration(controller.transitionTime/2)
        .attr('transform', `translate(0, ${height_pca})`)
        .call(d3.axisBottom()
            .scale(xScalePca)
            .tickSize(-height_pca, 0, 0)
            .tickFormat(''))

    // call Grid oriziontal
    pcaYGridSvg 
        .transition()
        .duration(controller.transitionTime/2)
        .call(d3.axisLeft()
            .scale(yScalePca)
            .tickSize(-width_pca, 0, 0)
            .tickFormat(''))

    
    // add circles
    pcaCircles = pcaArea.append('g')
        .selectAll("circle")
        .data(dataFiltered)

    pcaCircles
        .enter()
        .append("circle")
        //.merge(PcaCircles)
            .on("mouseover", onPoint)
            .on("mousemove", moveOverPoint)
            .on("mouseout", leavePoint)
            .attr('class', 'pca-points') 
            .style("fill", (d) => colorScale(colorValuePca(d))) 
            .style("opacity", 1)
            //.transition()
            //.duration(0)    // needed for delay
            .attr("cx", (d) => xScalePca(xValuePca(d)))
            .attr("cy", (d) => yScalePca(yValuePca(d)))
            .attr("r", pca_circle_size)
            //.delay( (d,i) => (i*scatter_points_delay)/100)

}



////////////////////////// HELP FUNCTIONS //////////////////////////


// update data on year changed
const updatePca = () => {
    svgPca.selectAll('.pca-points').remove().exit()
    makePca();
};




