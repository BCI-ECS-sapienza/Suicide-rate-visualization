// legend static params
const colorLabel = 'Suicide ratio'
const initial_width_legend = document.getElementById('map-legend').offsetWidth;
const initial_height_legend = document.getElementById('map-legend').offsetHeight;

// set the dimensions and margins of the graph
const margin_legend = {top: 40, right: 10, bottom: 10, left: 20},
    width_legend = initial_width_legend - margin_legend.left - margin_legend.right,
    height_legend = initial_height_legend - margin_legend.top - margin_legend.bottom;

const svgLegend = d3.select("#map-legend")
    .append("svg")
        .attr("width", initial_width_legend)
        .attr("height", initial_height_legend)
    .append("g")
    .attr("transform", "translate(" + margin_legend.left + "," + margin_legend.top + ")");  //padding

function makeLegend() {
    const dataFiltered = aggregateDataByCountry(controller.dataFiltered);

    // set scale
    const colorValue = d => d.value.suicides_pop;
    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(dataFiltered,colorValue)])
        .range(controller.suicideColorScale);

    // legend setup
    const legend = d3.legendColor().scale(colorScale)
        .labelFormat(d3.format(".0f")).title(colorLabel);

    // add legend
    svgLegend
        .attr('class', 'legend')
        .call(legend)
            .attr("class","axis-text");
}

// update data chart
controller.addListener('yearChanged', function (e) {
    svgLegend.selectAll('.legend').remove()
    makeLegend()
  });