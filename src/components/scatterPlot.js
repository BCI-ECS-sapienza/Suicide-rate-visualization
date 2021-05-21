// Width and Height of the box
const initial_width_scatter = document.getElementById('scatterPlot').offsetWidth;
const initial_height_scatter = document.getElementById('scatterPlot').offsetHeight;

// set the dimensions and margins of the graph
const margin_scatter = {top: 50, right: 50, bottom: 50, left: 80},
    width_scatter = initial_width_scatter - margin_scatter.left - margin_scatter.right,
    height_scatter = initial_height_scatter - margin_scatter.top - margin_scatter.bottom;

// useful vars
const colors = controller.getSuicideColorScale();


// append the svg object to the body of the page
var svgScatter = d3.select("#scatterPlot")
    .append("svg")
        .attr("width", initial_width_scatter)
        .attr("height", initial_height_scatter)
    .append("g")
        .attr("transform", "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");


function makeScatterPlot() {
    const dataYear = controller.getDataYear();  //always used for scales
    const dataFiltered = controller.getDataFiltered();
    
        
    // add X axis
    var x = d3.scaleLog()
        .domain(d3.extent(dataYear, d => d.gdp_for_year)).nice()
        .range([ 0, width_scatter ]);
    svgScatter.append("g")
        .attr("transform", "translate(0," + height_scatter + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("class","axis-text");

    // add Y axis
    var y = d3.scaleLinear()
        .domain(d3.extent(dataYear, d => d.gdp_per_capita)).nice()
        .range([ height_scatter, 0]);
    svgScatter.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
            .attr("class","axis-text");

    // color scale
    var color = d3.scaleLinear()
        .domain(d3.extent(dataYear, d => d.suicides_pop))
        .range(colors);


     
    // if (controller.isDataFiltered) 
    // show also all data for the year but opacity 0.2
    
    
    // else show only data filtered
    var myCircle = svgScatter.append('g')
        .selectAll("circle")
        .data(dataFiltered)
        .enter()
        .append("circle")
            .attr("cx", function (d) { return x(d.gdp_for_year); } )
            .attr("cy", function (d) { return y(d.gdp_per_capita); } )
            .attr("r", 4)
            .style("fill", function (d) { return color(d.suicides_pop) } )
            .style("opacity", 1)
            .style("stroke", "white");
    
}


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
    makeScatterPlot();
});