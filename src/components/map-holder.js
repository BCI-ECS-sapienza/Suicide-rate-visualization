// Width and Height of the whole visualization
const widthMap = document.getElementById('map-holder').offsetWidth;
const heightMap = document.getElementById('map-holder').offsetHeight;

// Create SVG
const map = d3.select( '#map-holder' )
  .append( "svg" )
  .attr( "width", '100%' )
  .attr( "height", '100%' )
  .attr('viewBox', ("0 0 "+ widthMap + " " + heightMap));

// Create path and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  .scale(100, 30)
  .center([0, 10])
  .translate([widthMap/2, heightMap/2]);


function makeMap() {
  // setting parameters
  const dataYearLoaded = controller.getDataYear();
  const dataFilteredLoaded = controller.getDataFiltered();

  const dataYear = aggregateDataMap(dataYearLoaded);
  const dataFiltered = aggregateDataMap(dataFilteredLoaded);
  const colorLabel = 'Suicide ratio';
  
  const countryNames = d => d.key;
  const suicidesValue = d => d.value.suicides_pop;

  const max_val_year_x = d3.max(dataYear, suicidesValue); 
  const max_val_filtered_x = d3.max(dataFiltered, suicidesValue); 

  
  // mapping (country, #suicides) in data
  const data = d3.map();
  for (var i = 0; i<dataFiltered.length; i++){
    data.set(dataFiltered[i].key, +dataFiltered[i].value.suicides_pop);
  }
  

  // Data and color scale
  const colorArray = controller.suicideColorScale;
  const colorScale = d3.scaleQuantize()
        .domain([0, max_val_filtered_x])
        .range(colorArray);

  // Legend
  const g = map.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20, 100)");
  const legend = d3.legendColor().scale(colorScale)
    .labelFormat(d3.format(".0f"))
    .title(colorLabel);
  map.select(".legendThreshold")
    .call(legend)
      .attr("class","axis-text");
  
  var tool_tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return d.properties.name + ": "+d.total;
    })
    map.call(tool_tip);

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
        if(typeof(data.get(d.properties.name)) === "undefined"){
          d.total = 'Missing data';
          return '#DCDCDC'; 
        }
        else{
          d.total = data.get(d.properties.name);// || 0;
          return colorScale(d.total);
        }        
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      // adding event on mouseover
      .on("mouseover", function (d) {
        d3.select(this)
            .style("fill", '#80ced6')
            .style("cursor", "pointer");
        /*d3.select('#tooltip')
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition().duration(400)
            .style("opacity", 1)
            .text(d.properties.name + ': ' + d.total);*/
        tool_tip
          .direction('se')
          .show(d);
      })
      // adding event on mouseout
      .on("mouseout", function(d){
        d3.select(this)
          .style("fill", (d)=>{
            if(d.total === "Missing data") 
              return '#DCDCDC';
            else{
              return colorScale(d.total);
            }
          });	
        /*d3.select('#tooltip')
          .transition().duration(300)
          .style("opacity", 0);*/
        tool_tip.hide()
      })
  });
}

// aggregate data by sex
const aggregateDataMap = (dataIn) => {
  const data = d3.nest()
    .key( (d) => d.country)
    .rollup( (d) =>  ({
      suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop))
    }))
  .entries(dataIn)
  return data;
};

// draw map on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeMap();
});