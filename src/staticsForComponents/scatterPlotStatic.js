// chart static params
const initial_width_scatterPlot = document.getElementById('scatterPlot').offsetWidth;
const initial_height_scatterPlot = document.getElementById('scatterPlot').offsetHeight;
const scatter_xLabel = 'GDP for year';;
const scatter_yLabel = 'GDP per capita';
const scatter_circle_size = 5;
const scatter_selected_circle_size = 10;
const scatter_transition_time = 1000;

// set the dimensions and margins of the graph
const margin_scatterPlot = {top: 25, right: 25, bottom: 60, left: 80},
    width_scatterPlot = initial_width_scatterPlot - margin_scatterPlot.left - margin_scatterPlot.right,
    height_scatterPlot = initial_height_scatterPlot - margin_scatterPlot.top - margin_scatterPlot.bottom;


// append the svg object to the body of the page
const svgScatterPlot = d3.select("#scatterPlot")
    .append("svg")
      .attr("width", initial_width_scatterPlot)
      .attr("height", initial_height_scatterPlot)
    .append("g")
      .attr("transform", "translate(" + margin_scatterPlot.left + "," + margin_scatterPlot.top + ")");  //padding


// add label left
const scatter_left_label_x = ((margin_scatterPlot.left/5) * 3) +3;
const scatter_left_label_y = (height_scatterPlot/2);
svgScatterPlot.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-scatter_left_label_x}, ${scatter_left_label_y}), rotate(-90)`) 
    .text(scatter_yLabel)


// add label bottom
const scatter_bottom_label_x = width_scatterPlot/2;
const scatter_bottom_label_y = height_scatterPlot + ((margin_scatterPlot.bottom/6)*5);
svgScatterPlot.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${scatter_bottom_label_x},${scatter_bottom_label_y})`) //to put on bottom
    .text(scatter_xLabel)

const tooltipScatter = d3.select("#scatterPlot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-scatter")
    
