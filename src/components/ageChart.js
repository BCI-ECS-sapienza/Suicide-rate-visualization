// Width and Height of the box
const initial_width_ageChart = document.getElementById('ageChart').offsetWidth;
const initial_height_ageChart = document.getElementById('ageChart').offsetHeight;

// set the dimensions and margins of the graph
const margin_ageChart = {top: 40, right: 40, bottom: 60, left: 90},
    width_ageChart = initial_width_ageChart - margin_ageChart.left - margin_ageChart.right,
    height_ageChart = initial_height_ageChart - margin_ageChart.top - margin_ageChart.bottom;

// append the svg object to the body of the page
var svgAge = d3.select("#ageChart")
    .append("svg")
      .attr("width", initial_width_ageChart)
      .attr("height", initial_height_ageChart)
    .append("g")
      .attr("transform", "translate(" + margin_ageChart.left + "," + margin_ageChart.top + ")");  //padding
    

function makeAgeChart() {

  const dataYear = [
    { country: "Albania", age: "male", age:"10-20", suicides_pop: "400"},
    { country: "Albania", age: "male", age:"20-30", suicides_pop: "500"},
    { country: "Italy", age: "male", age:"30-40", suicides_pop: "350"},
    { country: "Italy", age: "male", age:"40-50", suicides_pop: "400"},
    { country: "Italy", age: "male", age:"50-60", suicides_pop: "350"},
  ];

  const dataFiltered = [
    { country: "Albania", age: "male", age:"10-20", suicides_pop: "300"},
    { country: "Albania", age: "male", age:"20-30", suicides_pop: "250"},
    { country: "Italy", age: "male", age:"30-40", suicides_pop: "350"},
    { country: "Italy", age: "male", age:"40-50", suicides_pop: "300"},
    { country: "Italy", age: "male", age:"50-60", suicides_pop: "320"},
  ];

  //const dataYear = aggregate(dataYearLoaded)

  // set params
  const xValue = d => d.age;
  const yValue = d => d.suicides_pop;
  const xLabel = 'Age';;
  const yLabel = 'Avg. #suicides/100k pop';
  const xPadding = 0.5;
  const barColors = ['#8c510a','#d8b365','#f6e8c3','#c7eae5','#5ab4ac','#01665e'];
  const behind_opacity = 0.3;

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataYear.map(xValue))
    .range([ 0, width_ageChart ])
    .padding(xPadding);

  const max_val = d3.max(dataYear, yValue) 
  const domain_max = parseInt(max_val) + parseInt(max_val/10) //adds some padding on top
  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_ageChart, 0])
    .nice();

  const color = d3.scaleOrdinal()
    .domain(dataYear.map(xValue))
    .range(barColors);

  // axis format
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
  const left_label_x = ((margin_ageChart.left/5) * 3) +3;
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
  if (controller.isDataFiltered) {
    svgAge.selectAll()
      .data(dataYear)
      .enter()
      .append('g')
      .append('rect')
      .attr('x', (d) => xScale(d.age))
      .attr('y', (d) => yScale(d.suicides_pop))
      .attr('height', (d) => height_ageChart - yScale(d.suicides_pop))
      .attr('width', xScale.bandwidth())
      .style("fill",  (d) => color(d.age))
      .style("stroke", "black") 
      .attr('opacity', behind_opacity)
  } 


  // add filtered bars
  const barGroups =  svgAge.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')
    
  barGroups
    .append('rect')
    .attr('x', (d) => xScale(d.age))
    .attr('y', (d) => yScale(d.suicides_pop))
    .attr('height', (d) => height_ageChart - yScale(d.suicides_pop))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => color(d.age))
    .style("stroke", "black")  
    .style("stroke-width", 1.5)
    .on('mouseenter', function (actual, i) {
      // all original values on bars transparent
      d3.selectAll('.bar-value-age')  
        .attr('opacity', 0)

      // enlarge bar
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (a) => xScale(a.age) - 5)
        .attr('width', xScale.bandwidth() + 10)

      // show value on bar
      barGroups.append('text')
        .attr('class', 'divergence-age')  //needed to remove on mouseleave
        .attr('x', (a) => xScale(a.age) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.suicides_pop) + 30)
        .attr('text-anchor', 'middle')
        .text((a, idx) => {
          const divergence = (a.suicides_pop - actual.suicides_pop).toFixed(1)
          
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
        .attr('x', (a) => xScale(a.age))
        .attr('width', xScale.bandwidth())

      // remove divergence value
      svgAge.selectAll('.divergence-age').remove()
    })

  // add values on bars
  barGroups 
    .append('text')
    .attr('class', 'bar-value-age')
    .attr('x', (a) => xScale(a.age) + xScale.bandwidth() / 2)
    .attr('y', (a) => yScale(a.suicides_pop) + 30)
    .attr('text-anchor', 'middle')
    .text((a) => `${a.suicides_pop}`)

}


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeAgeChart();
});

