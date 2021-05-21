// Width and Height of the box
const initial_width_sexChar = document.getElementById('sexChart').offsetWidth;
const initial_height_sexChar = document.getElementById('sexChart').offsetHeight;

// set the dimensions and margins of the graph
const margin_sexChar = {top: 40, right: 40, bottom: 40, left: 60},
    width_sexChar = initial_width_sexChar - margin_sexChar.left - margin_sexChar.right,
    height_sexChar = initial_height_sexChar - margin_sexChar.top - margin_sexChar.bottom;

// append the svg object to the body of the page
var svgSex = d3.select("#sexChart")
    .append("svg")
      .attr("width", initial_width_sexChar)
      .attr("height", initial_height_sexChar)
    .append("g")
      .attr("transform", "translate(" + margin_sexChar.left + "," + margin_sexChar.top + ")");  //padding
    

function makeSexChart() {

  const dataYear = [
    { country: "Albania", sex: "male", age:"10-20", suicides_pop: "400"},
    { country: "Albania", sex: "female", age:"10-20", suicides_pop: "250"},
  ];

  const dataFiltered = [
    { country: "Albania", sex: "male", age:"10-20", suicides_pop: "400"},
    { country: "Albania", sex: "female", age:"10-20", suicides_pop: "250"},
  ];

  //const dataYear = aggregate(dataYearLoaded)

  // set params
  const xValue = d => d.sex;
  const yValue = d => d.suicides_pop;
  const xPadding = 0.5;
  const barColors = ['#f1a340','#998ec3'];

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataYear.map(xValue))
    .range([ 0, width_sexChar ])
    .padding(xPadding);

  const max_val = d3.max(dataYear, yValue) 
  const domain_max = parseInt(max_val) + parseInt(max_val/10)
  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_sexChar, 0])
    .nice();

  const color = d3.scaleOrdinal()
    .domain(dataYear.map(xValue))
    .range(barColors);

  // axis format
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);


  // add X axis
  svgSex.append("g")
    .attr("transform", "translate(0," + height_sexChar + ")") //to put on bottom
    .call(xAxis)
    .selectAll("text")  //text color
      .attr("class","axis-text");

  // add Y axis
  svgSex.append("g")
   .call(yAxis)
   .selectAll("text")
       .attr("class","axis-text");

  // add Grid 
  svgSex.append('g')
    .attr('class', 'grid-barchart')
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width_sexChar, 0, 0)
      .tickFormat(''))


  // add filtered bars
  const barGroups =  svgSex.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')

  barGroups
    .append('rect')
    .attr('x', (d) => xScale(d.sex))
    .attr('y', (d) => yScale(d.suicides_pop))
    .attr('height', (d) => height_sexChar - yScale(d.suicides_pop))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => color(d.sex))
    .style("stroke", "black")  
    .on('mouseenter', function (actual, i) {
      // all value on bar transparent
      d3.selectAll('.bar-value')  
        .attr('opacity', 0)

      // enlarge bar
      d3.select(this)
        .transition()
        .duration(200)
        .attr('x', (a) => xScale(a.sex) - 5)
        .attr('width', xScale.bandwidth() + 10)

      // show value on bar
      barGroups.append('text')
        .attr('class', 'divergence')
        .attr('x', (a) => xScale(a.sex) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.suicides_pop) + 30)
        .attr('fill', 'rgb(250, 250, 250)')
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
      d3.selectAll('.bar-value')
        .attr('opacity', 1)

      d3.select(this)
        .transition()
        .duration(200)
        .attr('x', (a) => xScale(a.sex))
        .attr('width', xScale.bandwidth())

      svgSex.selectAll('#limit').remove()
      svgSex.selectAll('.divergence').remove()
    })

  // add value on bar 
  barGroups 
    .append('text')
    .attr('class', 'bar-value')
    .attr('x', (a) => xScale(a.sex) + xScale.bandwidth() / 2)
    .attr('y', (a) => yScale(a.suicides_pop) + 30)
    .attr('text-anchor', 'middle')
    .text((a) => `${a.suicides_pop}`)

}


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeSexChart();
});

