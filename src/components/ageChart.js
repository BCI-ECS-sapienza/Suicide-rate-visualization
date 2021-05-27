function makeAgeChart(colorScale) {
  const dataAll = aggregateDataByAge(controller.dataAll);
  const dataFiltered = aggregateDataByAge(controller.dataFiltered);

  // sort ages
  dataAll.sort((a, b) => d3.ascending(a.key, b.key));
  dataFiltered.sort((a, b) => d3.ascending(a.key, b.key));

  // set params
  const xValue = d => d.key;
  const yValue = d => d.value.suicides_pop;
  let selectedBars = new Set();
  let selectedValues = new Set();

  // add some padding on top yAxis (1/10 more than max between dataAll and dataFiltered)
  const max_val_year = d3.max(dataAll, yValue) 
  const max_val_filtered = d3.max(dataFiltered, yValue) 
  const max_val = (max_val_year >  max_val_filtered) ? max_val_year : max_val_filtered;
  const domain_max = parseInt(max_val) + parseInt(max_val/10) 

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataAll.map(xValue))
    .range([ 0, width_ageChart ])
    .padding(age_xPadding);

  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_ageChart, 0])
    .nice();

  // axis setup
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);


  // add X axis
  svgAge.append("g")
    .attr("transform", "translate(0," + height_ageChart + ")") //to put on bottom
    .call(xAxis)
    .selectAll("text")  //text color
      .attr("class","axis-text");

  // add Y axis
  svgAge.append("g")
   .call(yAxis)
   .selectAll("text")
       .attr("class","axis-text");

  // add Grid 
  svgAge.append('g')
    .attr('class', 'grid-barchart')
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width_ageChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataAll behind with low opacity
  if (controller.isDataFiltered == true) {
    svgAge.selectAll()
      .data(dataAll)
      .enter()
      .append('g')
      .append('rect')
      .attr('class', 'ageBars-back')
      .attr('x', (d) => xScale(xValue(d)) + age_backOffset)
      .attr('y', (d) => yScale(yValue(d)))
      .attr('height', (d) => height_ageChart - yScale(yValue(d)))
      .attr('width', xScale.bandwidth() + age_backOffset)
      .style("fill",  (d) => colorScale(yValue(d)))
      .style("stroke", "black") 
      .attr('opacity', age_behindOpacity)
  } 


  // add filtered bars
  const barGroups =  svgAge.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')
    
  barGroups
    .append('rect')
    .attr('class', 'ageBars-filtered')
    .attr('x', (d) => xScale(xValue(d)))
    .attr('y', (d) => yScale(yValue(d)))
    .attr('height', (d) => height_ageChart - yScale(yValue(d)))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => colorScale(yValue(d)))
    .on('mouseenter', function (actual, i) {
      // all original values on bars transparent
      d3.selectAll('.bar-value-age')  
        .attr('opacity', 0)

      // enlarge bar
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (d) => xScale(xValue(d)) - 5)
        .attr('width', xScale.bandwidth() + 10)
        .style("cursor", "pointer");

      // show value on bar
      barGroups.append('text')
        .attr('class', 'divergence-age')  //needed to remove on mouseleave
        .attr('x', (d) => xScale(xValue(d)) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(yValue(d)) + 30)
        .attr('text-anchor', 'middle')
        .text((d, idx) => {
          const divergence = (yValue(d) - actual.value.suicides_pop).toFixed(1)
          
          let text = ''
          if (divergence > 0) text += '+'
          text += `${divergence}`

          return idx !== i ? text : '';
        })

    })
    .on('mouseleave', function () {
      d3.selectAll('.bar-value-age')
        .attr('opacity', 1)

      // bar to normal size
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (d) => xScale(xValue(d)))
        .attr('width', xScale.bandwidth())

      // remove divergence value
      svgAge.selectAll('.divergence-age').remove()
    })
    .on('click', function (e) {
      // toggle bar selection highlight and get class
      if (d3.select(this).classed("selected-bar") == false) {
        d3.select(this).classed("selected-bar", true)
        selectedBars.add(xValue(this.__data__))
        selectedValues.add(yValue(this.__data__))
      } 
      else {
        d3.select(this).classed("selected-bar", false);
        selectedBars.delete(xValue(this.__data__))
        selectedValues.delete(yValue(this.__data__))
      }
      
      controller.triggerAgeFilterEvent(selectedBars);
      svgAge.selectAll('.avg-line-selected').remove();
      svgAge.selectAll('.avg-label-selected').remove();

      
      if (selectedValues.size > 0){
        // remove basic avg
        svgAge.selectAll('.avg-line').remove();
        svgAge.selectAll('.avg-label').remove();

        // add avg line selected
        const avg_value = Math.round(sumSet(selectedValues)/selectedValues.size *10) /10;
        const avg_value_scaled = yScale(avg_value)

        svgAge.append("line")
          .attr('class', 'avg-line-selected')
          .attr("x1", 0)
          .attr("x2", width_ageChart+2)
          .attr("y1", avg_value_scaled)
          .attr("y2", avg_value_scaled)
        
        // avg value print selected
        svgAge.append("text")
          .attr('class', 'avg-label-selected')
          .attr("text-anchor", "middle")
          .attr("transform", `translate(${width_ageChart-20}, ${avg_value_scaled-10})`) 
          .text(avg_value)
      }
      else {
        // get back basic avg
        const avg_value = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length*10) /10;
        const avg_value_scaled = yScale(avg_value)
        svgAge.append("line")
          .attr('class', 'avg-line')
          .attr("x1", 0)
          .attr("x2", width_ageChart+2)
          .attr("y1", avg_value_scaled)
          .attr("y2", avg_value_scaled)
        
        // avg value print
        svgAge.append("text")
          .attr('class', 'avg-label')
          .attr("text-anchor", "middle")
          .attr("transform", `translate(${width_ageChart-20}, ${avg_value_scaled-10})`) 
          .text(avg_value)
      }
    })


  // add values on bars
  barGroups 
    .append('text')
    .attr('class', 'bar-value-age')
    .attr('x', (d) => xScale(xValue(d)) + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(yValue(d)) + 30)
    .attr('text-anchor', 'middle')
    .text((d) => `${yValue(d)}`)

  // add avg line
  const avg_value = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length*10) /10;
  const avg_value_scaled = yScale(avg_value)
  svgAge.append("line")
    .attr('class', 'avg-line')
    .attr("x1", 0)
    .attr("x2", width_ageChart+2)
    .attr("y1", avg_value_scaled)
    .attr("y2", avg_value_scaled)
  
  // avg value print
  svgAge.append("text")
    .attr('class', 'avg-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width_ageChart-20}, ${avg_value_scaled-10})`) 
    .text(avg_value)

}


// update data chart
controller.addListener('yearChanged', function (e) {
  svgAge.selectAll('.axis-text').remove()
  svgAge.selectAll('.tick').remove()
  svgAge.selectAll('.grid-barchart').remove()
  svgAge.selectAll('.ageBars-back').remove()
  svgAge.selectAll('.ageBars-filtered').remove()
  svgAge.selectAll('.bar-value-sex').remove()
  svgAge.selectAll('.avg-line').remove()
  svgAge.selectAll('.avg-label').remove()
  makeAgeChart(controller.colorScale)
});

