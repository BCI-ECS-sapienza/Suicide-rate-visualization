const makeSexChart = () => {

  // callback for mouseover bar
  const mouseOver = function (actual, i) {
    // all original values on bars transparent
    d3.selectAll('.bar-value-sex')  
      .attr('opacity', 0)

    // enlarge bar
    d3.select(this)
      .transition()
      .duration(sex_transition_time)
      .attr('x', (d) => xScale(xValue(d)) - 5)
      .attr('width', xScale.bandwidth() + 10)
      .style("cursor", "pointer");

    // show value on bar
    barGroups.append('text')
      .attr('class', 'divergence-sex')  //needed to remove on mouseleave
      .attr('x', (d) => xScale(xValue(d)) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(yValue(d)) + 30)
      .attr('text-anchor', 'middle')
      .text((d, idx) => {
        const divergence = (yValue(d) - actual.value.suicides_pop).toFixed(1)
        
        let text = ''
        if (divergence > 0) text += '+'
        text += `${divergence}`

        return idx !== i ? text : `${actual.value.suicides_pop}`;
      })

  }

  // callback for mouseLeave bar
  const mouseLeave = function () {
    d3.selectAll('.bar-value-sex')
      .attr('opacity', 1)

    // bar to normal size
    d3.select(this)
      .transition()
      .duration(sex_transition_time)
      .attr('x', (d) => xScale(xValue(d)))
      .attr('width', xScale.bandwidth())

    // remove divergence value
    svgSex.selectAll('.divergence-sex').remove()
  }

  // callback for mouseClick bar
  const mouseClick = function (e) {
    let selection = xValue(this.__data__)

    // toggle bar selection highlight
    if (d3.select(this).classed("selected-bar") == false) {
      d3.selectAll('.sexBars-filtered').classed("selected-bar", false) // so that the other get toggle
      d3.select(this).classed("selected-bar", true)
    } else {
      d3.select(this).classed("selected-bar", false);
      selection = 'All' // toggle agin => back to all
    }

    // apply filter
    controller.triggerSexFilterEvent(selection);
  }



  // get data
  const dataAll = aggregateDataBySex(controller.dataAll);
  const dataFiltered = aggregateDataBySex(controller.dataSex);
  const colorScale = controller.colorScale;

  // sort classes
  dataAll.sort((a, b) => d3.descending(a.key, b.key));
  dataFiltered.sort((a, b) => d3.descending(a.key, b.key));

  // set data iterators
  const xValue = d => d.key;
  const yValue = d => d.value.suicides_pop;


  // add some padding on top yAxis (1/10 more than max between dataAll and dataFiltered)
  const max_val_year = d3.max(dataAll, yValue) 
  const max_val_filtered = d3.max(dataFiltered, yValue) 
  const max_val = (max_val_year >  max_val_filtered) ? max_val_year : max_val_filtered;
  const domain_max = parseInt(max_val) + parseInt(max_val/10) 

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataAll.map(xValue))
    .range([ 0, width_sexChart ])
    .padding(sex_xPadding);

  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_sexChart, 0])
    .nice();

  // axis setup
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);

  // compute avg line
  const avg_value = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length *10) /10;
  const avg_value_scaled = yScale(avg_value)


  // call X axis
  sexXAxisSvg.transition()
    .duration(controller.transitionTime/2)
    .call(xAxis)
    .selectAll("text")  
      .attr("class","axis-text");

  // call Y axis
  sexYAxisSvg.transition()
    .duration(controller.transitionTime/2)
    .call(yAxis)
    .selectAll("text")
      .attr("class","axis-text");

  // call Grid 
  sexYGridSvg.transition()
    .duration(controller.transitionTime/2)
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width_sexChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataAll behind with low opacity
  if (controller.isYearFiltered == true) {
    svgSex.selectAll()
      .data(dataAll)
      .enter()
      .append('g')
      .append('rect')
      .attr('class', 'sexBars-back')
      .attr('x', (d) => xScale(xValue(d)) + sex_backOffset)
      .attr('y', (d) => yScale(yValue(d)))
      .attr('height', (d) => height_sexChart - yScale(yValue(d)))
      .attr('width', xScale.bandwidth() + sex_backOffset)
      .style("fill",  (d) => colorScale(yValue(d)))
      .style("stroke", "black") 
      .attr('opacity', sex_behindOpacity)
  } 


  // add filtered bars
  const barGroups =  svgSex.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')
    
  barGroups
    .append('rect')
    .on('mouseenter', mouseOver)
    .on('mouseleave', mouseLeave)
    .on('click', mouseClick)
    .attr('class', 'sexBars-filtered')
    .attr('x', (d) => xScale(xValue(d)))
    .attr('y', (d) =>  yScale(0))
    .attr('height', (d) => height_sexChart - yScale(0))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => colorScale(yValue(d)))
    
  // for the bars animations
  barGroups.selectAll("rect")
    .transition()
    .duration(controller.transitionTime/3)
    .attr('y', (d) =>  yScale(yValue(d)))
    .attr('height', (d) => height_sexChart - yScale(yValue(d)))
    .delay( (d,i) => i*controller.transitionTime*2)
    

  // add values on bars
  barGroups 
    .append('text')
    .attr('opacity', 0)
    .attr('class', 'bar-value-sex')
    .attr('x', (d) => xScale(xValue(d)) + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(yValue(d)) + 30)
    .attr('text-anchor', 'middle')
    .transition()
    .duration(controller.transitionTime)
    .text((d) => `${yValue(d)}`)
    .attr('opacity', 1)


  // add avg line
  printAvgY(svgSex, avg_value, avg_value_scaled, width_sexChart)

}



////////////////////////// UPDATE FUNCTIONS //////////////////////////

const updateSexChart = () => {
  svgSex.selectAll('.sexBars-back').remove()
  svgSex.selectAll('.sexBars-filtered').remove()
  svgSex.selectAll('.bar-value-sex').remove()
  svgSex.selectAll('.avg-line').remove()
  svgSex.selectAll('.avg-label').remove()
  makeSexChart()
}