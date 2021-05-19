// Width and Height of the whole visualization
var width = document.getElementById('map-holder').offsetWidth;
var height = document.getElementById('map-holder').offsetHeight;

// Create SVG
var map = d3.select( '#map-holder' )
    .append( "svg" )
    .attr( "width", '100%' )
    .attr( "height", '100%' )
    .attr('viewBox', ("0 0 "+ width + " " + height));

var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(100, 30)
    .center([0, 10])
    .translate([width/2, height/2]);


// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
  //.defer(d3.csv, "../../data/data.csv", function(d) { data.set(d.country, +d.suicides_pop); })
  .await(ready);


// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000]) //, 500000000])
  .range(d3.schemeReds[5]);


function ready(error, topo) {
    // Draw the map
    map.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
        // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", function (d) {
        d3.select(this)
            .style("fill", '#80ced6')
            .style("cursor", "pointer");
        d3.select('#tooltip')
            .transition().duration(200)
            .style('opacity', 1).text(d.id);
      })
      .on("mouseout", function(d){
        d3.select(this)
          .style("fill", colorScale(d.total));	
        d3.select('#tooltip')
          .style('opacity', 0);
      })
      .on('mousemove', function() {
        d3.select('#tooltip')
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY + 'px')
      })
      .call(d3.zoom().on("zoom", function () {
        map.attr("transform", d3.event.transform);
     }))
    }

// Legend
var rect = map.append('rect')
    .attr("width", '100')
    .attr("height", '120')
    .style("fill", 'lightgrey')
    .attr("transform", "translate(15, 80)");
var g = map.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20, 100)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Suicide ratio");

var labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
map.select(".legendThreshold")
    .call(legend);

// Tooltip
var tip = d3.select('#map-holder')
    .append('tip')
    .attr("id", "tooltip")			
    .attr('style', 'position: absolute; opacity: 0;');