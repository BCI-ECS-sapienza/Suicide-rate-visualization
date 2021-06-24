const makePca = () => {

    ////////////////////////// SETUP //////////////////////////
   
    // get data
    const dataFiltered = aggregateDataByCountry(controller.dataMapScatter); //!!!!!!!!!!!!!!!!!!!!!
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
            //.on("mouseover", onPoint)
            //.on("mousemove", moveOverPoint)
            //.on("mouseout", leavePoint)
            .attr('class', 'pca-points') 
            .attr('id', (d) => countryPca(d))   //!!!!!!!!!!!!!!
            .style("fill", (d) => colorScale(colorValuePca(d)))   //!!!!!!!!!!!!!!!
            .style("opacity", 1)
            .transition()
            .duration(0)    // needed for delay
            .attr("cx", (d) => xScalePca(xValuePca(d)))
            .attr("cy", (d) => yScalePca(yValuePca(d)))
            .attr("r", pca_circle_size)
            .delay( (d,i) => (i*pca_points_delay))

}



////////////////////////// HELP FUNCTIONS //////////////////////////


// update data on year changed
const updatePca = () => {
    svgPca.selectAll('.Pca-points').remove()
    svgPca.selectAll('.avg-line').remove()
    svgPca.selectAll('.avg-label').remove()
    makePca();
};




