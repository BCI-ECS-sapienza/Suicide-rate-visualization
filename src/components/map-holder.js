// Width and Height of the whole visualization
const width = document.getElementById('map-holder').offsetWidth;
const height = document.getElementById('map-holder').offsetHeight;

// Create SVG
const map = d3.select( '#map-holder' )
  .append( "svg" )
  .attr( "width", '100%' )
  .attr( "height", '100%' )
  .attr('viewBox', ("0 0 "+ width + " " + height));

// Create path and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  .scale(100, 30)
  .center([0, 10])
  .translate([width/2, height/2]);

// Data and color scale
//var data = d3.map();
//var colorScale = d3.scaleThreshold()
  //.domain([10000, 100000, 1000000, 3000000, 10000000]) //, 500000000])
  //.range(d3.schemeReds[5]);

function makeMap() {
  const dataYearLoaded = controller.getDataYear();
  const dataFilteredLoaded = controller.getDataFiltered();

  const dataYear = aggregateDataMap(dataYearLoaded);
  const dataFiltered = aggregateDataMap(dataFilteredLoaded);
  const colorLabel = 'Suicide ratio'

  // mapping (country, #suicides) in data
  const data = d3.map();
  for(var i = 0; i<dataFiltered.length; i++){
    data.set(dataFiltered[i].name, +dataFiltered[i].suicides);
  }

  // Data and color scale
  //var data = d3.map();
  const colorArray = controller.suicideColorScale;
  const colorValue = d => d.value.suicides_pop;
  const colorScale = d3.scaleThreshold()
  //const colorScale = d3.scaleQuantize()
        .domain(d3.extent(controller.getDataYear, colorValue))
        .range(colorArray);

  // Legend
  const g = map.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20, 100)");
  const labels = ['0', '1-5', '6-10', '11-25', '26-50'];
  const legend = d3.legendColor().scale(colorScale)
    .labelFormat(d3.format(".0f"))
    .title(colorLabel);
/*
  const legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);*/
  map.select(".legendThreshold")
    .call(legend)
      .attr("class","axis-text");
  
  // Tooltip
  const tip = d3.select('#map-holder')
    .append('tip')
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .attr('style', 'opacity: 0;');
  
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(json) {

    // Draw the map
    map.append("g")
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {    
        d.total = data.get(d.properties.name) || 0;
        console.log(d.total);
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      // adding event on mouseover
      .on("mouseover", function (d) {
        d3.select(this)
            .style("fill", '#80ced6')
            .style("cursor", "pointer");
        d3.select('#tooltip')
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition().duration(400)
            .style("opacity", 1)
            .text(d.properties.name + ': ' + d.total);
      })
      // adding event on mouseout
      .on("mouseout", function(d){
        d3.select(this)
          .style("fill", colorScale(d.total));	
        d3.select('#tooltip')
          .transition().duration(300)
          .style("opacity", 0);
      })
  });
}

// Function to manage data to be represented
const aggregateDataMap = (dataMap) => {
  const data = d3.nest()
    .key((d) => d.country)
    //.rollup((d) => Math.round(d3.sum(d, (g) => g.suicides_pop)))
    .rollup((d) => Math.round(d3.mean(d, (g) => g.suicides_pop)))
    .entries(dataMap)
    .map(function(group){
            return{
                name: group.key,
                suicides: group.value
        };
    })
  return data;
}
// draw map on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeMap();
});