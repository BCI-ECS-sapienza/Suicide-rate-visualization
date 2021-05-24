// Width and Height of the box
const initial_width_ageChart = document.getElementById('ageChart').offsetWidth;
const initial_height_ageChart = document.getElementById('ageChart').offsetHeight;

// set the dimensions and margins of the graph
const margin_ageChart = {top: 25, right: 30, bottom: 60, left: 70},
    width_ageChart = initial_width_ageChart - margin_ageChart.left - margin_ageChart.right,
    height_ageChart = initial_height_ageChart - margin_ageChart.top - margin_ageChart.bottom;

// append the svg object to the body of the page
const svgAge = d3.select("#ageChart")
    .append("svg")
      .attr("width", initial_width_ageChart)
      .attr("height", initial_height_ageChart)
    .append("g")
      .attr("transform", "translate(" + margin_ageChart.left + "," + margin_ageChart.top + ")");  //padding
    

function makeAgeChart() {
  const dataYearLoaded = controller.getDataYear();
  const dataFilteredLoaded = controller.getDataFiltered();

  const dataYear = aggregateDataAge(dataYearLoaded);
  const dataFiltered = aggregateDataAge(dataFilteredLoaded);

  // sort ages
  dataYear.sort((a, b) => d3.ascending(a.key, b.key));
  dataFiltered.sort((a, b) => d3.ascending(a.key, b.key));

  // set params
  const xValue = d => d.key;
  const yValue = d => d.value.suicides_pop;
  const xLabel = 'Age';;
  const yLabel = 'Suicide ratio';
  const xPadding = 0.5;
  const barColors = ['#f1eef6','#d0d1e6','#a6bddb','#74a9cf','#2b8cbe','#045a8d']; //['#8c510a','#d8b365','#f6e8c3','#c7eae5','#5ab4ac','#01665e'];
  const behindOpacity = 0.3;
  const backOffset = 5;

  // add some padding on top yAxis (1/10 more than max between dataYear and dataFiltered)
  const max_val_year = d3.max(dataYear, yValue) 
  const max_val_filtered = d3.max(dataFiltered, yValue) 
  const max_val = (max_val_year >  max_val_filtered) ? max_val_year : max_val_filtered;
  const domain_max = parseInt(max_val) + parseInt(max_val/10) 

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataYear.map(xValue))
    .range([ 0, width_ageChart ])
    .padding(xPadding);

  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_ageChart, 0])
    .nice();

  const color = d3.scaleOrdinal()
    .domain(dataYear.map(xValue))
    .range(barColors);

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

  // add label left
  const left_label_x = ((margin_ageChart.left/5) * 3);
  const left_label_y = (height_ageChart/2);
  svgAge.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-left_label_x}, ${left_label_y}), rotate(-90)`) 
    .text(yLabel)
   
  // add label bottom
  const bottom_label_x = width_ageChart/2;
  const bottom_label_y = height_ageChart + ((margin_ageChart.bottom/6)*5);
  svgAge.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${bottom_label_x},${bottom_label_y})`) //to put on bottom
    .text(xLabel)

  // add Grid 
  svgAge.append('g')
    .attr('class', 'grid-barchart')
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width_ageChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataYear behind with low opacity
  if (controller.isDataFiltered == true) {
    svgAge.selectAll()
      .data(dataYear)
      .enter()
      .append('g')
      .append('rect')
      .attr('x', (d) => xScale(d.key) + backOffset)
      .attr('y', (d) => yScale(d.value.suicides_pop))
      .attr('height', (d) => height_ageChart - yScale(d.value.suicides_pop))
      .attr('width', xScale.bandwidth() + backOffset)
      .style("fill",  (d) => color(d.key))
      .style("stroke", "black") 
      .attr('opacity', behindOpacity)
  } 


  // add filtered bars
  const barGroups =  svgAge.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')
    
  barGroups
    .append('rect')
    .attr('class', 'ageBars-filtered')
    .attr('x', (d) => xScale(d.key))
    .attr('y', (d) => yScale(d.value.suicides_pop))
    .attr('height', (d) => height_ageChart - yScale(d.value.suicides_pop))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => color(d.key))
    .on('mouseenter', function (actual, i) {
      // all original values on bars transparent
      d3.selectAll('.bar-value-age')  
        .attr('opacity', 0)

      // enlarge bar
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (d) => xScale(d.key) - 5)
        .attr('width', xScale.bandwidth() + 10)
        .style("cursor", "pointer");

      // show value on bar
      barGroups.append('text')
        .attr('class', 'divergence-age')  //needed to remove on mouseleave
        .attr('x', (d) => xScale(d.key) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.value.suicides_pop) + 30)
        .attr('text-anchor', 'middle')
        .text((d, idx) => {
          const divergence = (d.value.suicides_pop - actual.value.suicides_pop).toFixed(1)
          
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
        .attr('x', (d) => xScale(d.key))
        .attr('width', xScale.bandwidth())

      // remove divergence value
      svgAge.selectAll('.divergence-age').remove()
    })

  // add values on bars
  barGroups 
    .append('text')
    .attr('class', 'bar-value-age')
    .attr('x', (d) => xScale(d.key) + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(d.value.suicides_pop) + 30)
    .attr('text-anchor', 'middle')
    .text((d) => `${d.value.suicides_pop}`)

  // add avg line
  const avg_value = Math.round((d3.sum(dataFiltered, (d) => d.value.suicides_pop)) / dataFiltered.length);
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
    .attr("transform", `translate(${width_ageChart-15}, ${avg_value_scaled-10})`) 
    .text(avg_value)

}


// aggregate data by sex
const aggregateDataAge = (dataIn) => {
  const data = d3.nest()
    .key( (d) => d.age)
    .rollup( (d) =>  ({
      suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
    }))
  .entries(dataIn)
  return data;
};


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeAgeChart();
});

