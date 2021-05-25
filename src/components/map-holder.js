// width and weight of the whole container
const widthMap = document.getElementById('map-holder').offsetWidth;
const heightMap = document.getElementById('map-holder').offsetHeight;

// create SVG
const map = d3.select( '#map-holder' )
  .append( "svg" )
  .attr( "width", '100%' )
  .attr( "height", '100%' )
  .attr('viewBox', ("0 0 "+ widthMap + " " + heightMap));

// create path and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  //.scale(100, 30)
  //.center([0, 10])
  .scale(80 ,30)
  .center([0, 30])
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
  

  // data and color scale
  const colorArray = controller.suicideColorScale;
  const colorScale = d3.scaleQuantize()
        .domain([0, max_val_filtered_x])
        .range(colorArray);

  // legend
  /*const g = map.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20, 100)");
  const legend = d3.legendColor().scale(colorScale)
    .labelFormat(d3.format(".0f"))
    .title(colorLabel);
  map.select(".legendThreshold")
    .call(legend)
      .attr("class","axis-text");*/

  // tooltip
  var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return d.properties.name + ": "+d.total;
    })
    map.call(tooltip);
  
  // zoom and pan
  let zoom = d3.zoom()
   .scaleExtent([1, 2])
   .translateExtent([[-widthMap/10, -heightMap/10], [widthMap + widthMap/10, heightMap + heightMap/10]])
   .on('zoom', () => {
       map.attr('transform', d3.event.transform)
   });
   d3.select('#map-holder').call(zoom);

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
          d.total = data.get(d.properties.name);
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
        tooltip
          .style("left", (d + 'px'))   
          .style("top", (d3.mouse + "px"))
          //.direction('se')
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
        tooltip.hide()
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