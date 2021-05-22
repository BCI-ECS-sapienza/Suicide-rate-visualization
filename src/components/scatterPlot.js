// Width and Height of the box
const initial_width_scatterPlot = document.getElementById('scatterPlot').offsetWidth;
const initial_height_scatterPlot = document.getElementById('scatterPlot').offsetHeight;

// set the dimensions and margins of the graph
const margin_scatterPlot = {top: 40, right: 40, bottom: 60, left: 90},
    width_scatterPlot = initial_width_scatterPlot - margin_scatterPlot.left - margin_scatterPlot.right,
    height_scatterPlot = initial_height_scatterPlot - margin_scatterPlot.top - margin_scatterPlot.bottom;

// append the svg object to the body of the page
var svgScatterPlot = d3.select("#scatterPlot")
    .append("svg")
      .attr("width", initial_width_scatterPlot)
      .attr("height", initial_height_scatterPlot)
    .append("g")
      .attr("transform", "translate(" + margin_scatterPlot.left + "," + margin_scatterPlot.top + ")");  //padding
    

function makeScatterPlot() {

    const dataYear = controller.getDataAll();
    const dataFiltered = controller.getDataFiltered();

    //const dataYear = aggregate(dataYearLoaded)

    // set params
    const xValue = d => d.gdp_for_year;
    const yValue = d => d.gdp_per_capita;
    const colorValue = d => d.suicides_pop;
    const xLabel = 'GDP for year';;
    const yLabel = 'GDP per capita';
    const colorLabel = 'Avg. #suicides/100k pop'
    const colorArray = ['#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'];
    const circle_size = 3;
    const behind_opacity = 1;

    // set scales
    const max_val_x = d3.max(dataYear, xValue) 
    const domain_max_x = parseInt(max_val_x) + parseInt(max_val_x/10) //adds some padding on top
    const xScale = d3.scalePow()
        .domain([0, domain_max_x ])
        .range([ 0, width_scatterPlot ])

    const max_val_y = d3.max(dataYear, yValue) 
    const domain_max_y = parseInt(max_val_y) + parseInt(max_val_y/10) //adds some padding on top
    const yScale = d3.scaleLinear()
        .domain([0, domain_max_y ])
        .range([ height_scatterPlot, 0])
        .nice();

    const colorScale = d3.scaleThreshold()
        .domain(d3.extent(dataYear, colorValue))
        .range(colorArray);


    // axis format
    const xAxis = d3.axisBottom(xScale).tickFormat(AxisTickFormat);
    const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);


    // add X axis
    svgScatterPlot.append("g")
        .attr("transform", "translate(0," + height_scatterPlot + ")") //to put on bottom
        .call(xAxis)
        .selectAll("text")  //text color
        .attr("class","axis-text");

    // add Y axis
    svgScatterPlot.append("g")
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

    // add label left
    const left_label_x = ((margin_scatterPlot.left/5) * 3) +3;
    const left_label_y = (height_scatterPlot/2);
    svgScatterPlot.append('text')
        .attr('class', 'axis-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-left_label_x}, ${left_label_y}), rotate(-90)`) 
        .text(yLabel)
   
    // add label bottom
    const bottom_label_x = width_scatterPlot/2;
    const bottom_label_y = height_scatterPlot + ((margin_scatterPlot.bottom/6)*5) + 3;
    svgScatterPlot.append('text')
        .attr('class', 'axis-label')
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${bottom_label_x},${bottom_label_y})`) //to put on bottom
        .text(xLabel)

    // add Grid veritcal
    svgScatterPlot.append('g')
        .attr('class', 'grid-barchart') //background color
        .attr('transform', `translate(0, ${height_scatterPlot})`)
        .call(d3.axisBottom()
            .scale(xScale)
            .tickSize(-height_scatterPlot, 0, 0)
            .tickFormat(''))

    // add Grid oriziontal
    svgScatterPlot.append('g')
        .call(d3.axisLeft()
        .scale(yScale)
        .tickSize(-width_scatterPlot, 0, 0)
        .tickFormat(''))


    // else show only data filtered
    if (controller.isDataFiltered == true) {
        svgScatterPlot.append('g')
            .selectAll("circle")
            .data(dataYear)
            .enter()
            .append("circle")
                .attr("cx", (d) => xScale(d.gdp_for_year) )
                .attr("cy", (d) => yScale(d.gdp_per_capita))
                .attr("r", circle_size)
                .style("fill", (d) => colorScale(d.suicides_pop) )
                .style("opacity", behind_opacity)
                .style("stroke", "white");
    }
  



}


// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeScatterPlot();
});

