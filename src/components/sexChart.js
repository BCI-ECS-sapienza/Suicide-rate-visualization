// Width and Height of the whole visualization
var w = document.getElementById('sexChart').offsetWidth;
var h = document.getElementById('sexChart').offsetHeight;

// set the dimensions and margins of the graph
var margin = {top: 20, right: 81, bottom: 20, left: 40},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgSex = d3.select("#sexChart")
    .append("svg")
    .attr("height", '100%')
    .attr("width", '100%');
    //.attr("viewBox", "0 0 " + width + " " + height);
    

var myData = [{ "sex": "male", "tot": "200"},
              { "sex": "female", "tot": "300" }];
var max_tic = parseInt(d3.max(myData.map(function(d) { return d.tot; }))) + 100;

// Add Y axis
var y = d3.scaleLinear()
  .domain( [0, max_tic])
  .range([ height, 0]);
svgSex.append("g")
  .attr("class", "line")
  .attr("transform", "translate(" + margin.left + "," + margin.top +")")
  .call(d3.axisLeft(y))
  .selectAll("text")
    .attr("class","bar-text");

// X axis
var x = d3.scaleBand()
  .range([ 0, width])
  .domain(myData.map(function(d) { return d.sex; }))
  .padding(0.1);
svgSex.append("g")
  .attr("class", "line")
  .attr("transform", "translate(" + margin.left + "," + (height+margin.top) +")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("class","bar-text")
    .attr("transform", "translate(15,0)rotate(0)")
    .style("text-anchor", "end");

  // Bars
  svgSex.selectAll("mybar")
    .data(myData)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.sex) + margin.right; }) // + 78; })
      .attr("y", function(d) { return y(d.tot) + margin.top; })
      .attr("width", '30')
      .attr("height", function(d) { return height - y(d.tot); })
      .attr("fill", "#ff6666");

