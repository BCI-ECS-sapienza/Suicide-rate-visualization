// Width and Height of the box
const initial_width_sexChart = document.getElementById('sexChart').offsetWidth;
const initial_height_sexChart = document.getElementById('sexChart').offsetHeight;

// set the dimensions and margins of the graph
const margin_sexChart = {top: 40, right: 40, bottom: 60, left: 90},
    width_sexChart = initial_width_sexChart - margin_sexChart.left - margin_sexChart.right,
    height_sexChart = initial_height_sexChart - margin_sexChart.top - margin_sexChart.bottom;

// append the svg object to the body of the page
var svgSex = d3.select("#sexChart")
    .append("svg")
      .attr("width", initial_width_sexChart)
      .attr("height", initial_height_sexChart)
    .append("g")
      .attr("transform", "translate(" + margin_sexChart.left + "," + margin_sexChart.top + ")");  //padding
    

function makeSexChart() {

  const dataYear = [
    { country: "Albania", sex: "male", age:"10-20", suicides_pop: "400"},
    { country: "Albania", sex: "female", age:"10-20", suicides_pop: "250"},
  ];

  const dataFiltered = [
    { country: "Albania", sex: "male", age:"10-20", suicides_pop: "300"},
    { country: "Albania", sex: "female", age:"10-20", suicides_pop: "200"},
  ];

  //const dataYear = aggregate(dataYearLoaded)

  // set params
  const xValue = d => d.sex;
  const yValue = d => d.suicides_pop;
  const xLabel = 'Sex';;
  const yLabel = 'Avg. #suicides/100k pop';
  const xPadding = 0.5;
  const barColors = ['#af8dc3','#7fbf7b'];
  const behind_opacity = 0.3;

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataYear.map(xValue))
    .range([ 0, width_sexChart ])
    .padding(xPadding);

  const max_val = d3.max(dataYear, yValue) 
  const domain_max = parseInt(max_val) + parseInt(max_val/10) //adds some padding on top
  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_sexChart, 0])
    .nice();

  const color = d3.scaleOrdinal()
    .domain(dataYear.map(xValue))
    .range(barColors);

  // axis format
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);


  // add X axis
  svgSex.append("g")
    .attr("transform", "translate(0," + height_sexChart + ")") //to put on bottom
    .call(xAxis)
    .selectAll("text")  //text color
      .attr("class","axis-text");

  // add Y axis
  svgSex.append("g")
   .call(yAxis)
   .selectAll("text")
       .attr("class","axis-text");

  // add label left
  const left_label_x = ((margin_sexChart.left/5) * 3) +3;
  const left_label_y = (height_sexChart/2);
  svgSex.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-left_label_x}, ${left_label_y}), rotate(-90)`) 
    .text(yLabel)
   
  // add label bottom
  const bottom_label_x = width_sexChart/2;
  const bottom_label_y = height_sexChart + ((margin_sexChart.bottom/6)*5) + 3;
  svgSex.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${bottom_label_x},${bottom_label_y})`) //to put on bottom
    .text(xLabel)

  // add Grid 
  svgSex.append('g')
    .attr('class', 'grid-barchart')
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width_sexChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataYear behind with low opacity
  if (controller.isDataFiltered) {
    svgSex.selectAll()
      .data(dataYear)
      .enter()
      .append('g')
      .append('rect')
      .attr('x', (d) => xScale(d.sex))
      .attr('y', (d) => yScale(d.suicides_pop))
      .attr('height', (d) => height_sexChart - yScale(d.suicides_pop))
      .attr('width', xScale.bandwidth())
      .style("fill",  (d) => color(d.sex))
      .style("stroke", "black") 
      .attr('opacity', behind_opacity)
  } 


  // add filtered bars
  const barGroups =  svgSex.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')
    
  barGroups
    .append('rect')
    .attr('x', (d) => xScale(d.sex))
    .attr('y', (d) => yScale(d.suicides_pop))
    .attr('height', (d) => height_sexChart - yScale(d.suicides_pop))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => color(d.sex))
    .style("stroke", "black")  
    .style("stroke-width", 1.5)
    .on('mouseenter', function (actual, i) {
      // all original values on bars transparent
      d3.selectAll('.bar-value-sex')  
        .attr('opacity', 0)

      // enlarge bar
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (a) => xScale(a.sex) - 5)
        .attr('width', xScale.bandwidth() + 10)

      // show value on bar
      barGroups.append('text')
        .attr('class', 'divergence-sex')  //needed to remove on mouseleave
        .attr('x', (a) => xScale(a.sex) + xScale.bandwidth() / 2)
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
      d3.selectAll('.bar-value-sex')
        .attr('opacity', 1)

      // bar to normal size
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (a) => xScale(a.sex))
        .attr('width', xScale.bandwidth())

      // remove divergence value
      svgSex.selectAll('.divergence-sex').remove()
    })

  // add values on bars
  barGroups 
    .append('text')
    .attr('class', 'bar-value-sex')
    .attr('x', (a) => xScale(a.sex) + xScale.bandwidth() / 2)
    .attr('y', (a) => yScale(a.suicides_pop) + 30)
    .attr('text-anchor', 'middle')
    .text((a) => `${a.suicides_pop}`)

}


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeSexChart();
});

