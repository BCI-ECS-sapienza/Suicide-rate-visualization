// define parameters
const sides = 5;
const levels = 4;
const horizontal_margin = 40;
const vertical_margin = 10;

let width = document.getElementById('radar-pca').offsetWidth //+ horizontal_margin; GET error
let height = document.getElementById('radar-pca').offsetHeight //+ vertical_margin;

let size = Math.min(width, height);

const offset = Math.PI;
const polyangle = (Math.PI*2)/sides;

const offset_legend_width = width/2;
const offset_legend_height = height/2;

const r = 0.8 * size;
const r_0 = r/2;

const features = [
    'suicides_pop',
    'suicides_no',
    'population',
    'gdp_for_year',
    'gdp_per_capita'
]

let center = {
  x: width/2,
  y: height/2
}
const selectedColors = ['#af8dc3',
  '#f7f7f7',
  '#7fbf7b'];

const ticks = generateTicks(levels);

// define svg 
const svgRadar = d3.select('#radar-pca')
    .append('svg')
    .attr('opacity', 0)
    .attr('width', width + 60)
    .attr('height', height)
    .attr("transform", "translate(-" + 2*horizontal_margin + "," + vertical_margin + ")");

const g = svgRadar.append('g');

// countried legend heading
const countriesGroup = svgRadar.append('g');
countriesGroup
  .append('text')
  .attr('class', 'radar-heading-legend')
  .attr("x", (width/2 + 180))
  .attr("y", 20)
  .text("Countries:")
  .style("font-size", "18px")
  .attr("alignment-baseline","middle")
  .style('fill', 'white');

const featuresGroup = svgRadar.append('g');
  featuresGroup
  .append('text')
  .attr('class', 'radar-heading-legend')
  .attr("x", offset_legend_width + 180)
  .attr("y", offset_legend_height - 20)
  .text("Features max:")
  .style("font-size", "18px")
  .attr("alignment-baseline","middle")
  .style('fill', 'white');

// generate all the vertices of our polygon
let points = [];
const length = 100;
for (let vertex = 0; vertex<sides; vertex++){
  let theta = vertex * polyangle;
  points.push(generatePoint(length, theta));
}
points = points.concat(points[0]);

// draw the graph with data
function drawRadar(){
  // remove old elements from the radar before adding new ones
  svgRadar.selectAll('circle')
      .remove()
      .exit();
  svgRadar.selectAll('.levels')
    .remove()
    .exit();
  svgRadar.selectAll('.tick-lines')
    .remove()
    .exit();
  svgRadar.selectAll('.grid-lines')
    .remove()
    .exit();
  svgRadar.selectAll('.ticks')
    .remove()
    .exit();
  svgRadar.selectAll('.shape')
    .remove()
    .exit();
  svgRadar.selectAll('.indic')
    .remove()
    .exit();
  svgRadar.selectAll('path')
    .remove()
    .exit();
  svgRadar.selectAll('.labels-radar')
    .remove()
    .exit();
  svgRadar.selectAll('.radar-legend')
    .remove()
    .exit();

  // draw radar
  const dataFiltered = aggregateDataByCountryRadar(controller.dataMapScatter);
  
  let features_scale = getMaxFeatures();
  drawPath(points, g);
  generateAndDrawLevels(levels, sides);
  generateAndDrawLines(sides);
  drawAxis(ticks, levels);
  data = getData(dataFiltered);
  drawData(data, sides, features_scale);
  drawLabels(data, sides);
  drawLegendFeatures(features_scale);
}

// define functions called above
// function to get data
function getData(dataFiltered){ 
  let data = [];  
  if(controller.selectedCountries.length > 0){
      countries = []

      for(let i = 0; i<controller.selectedCountries.length; i++){
          countries.push(controller.selectedCountries[i].id)
      }
      
      for (let j = 0; j<dataFiltered.length; j++){
          if(countries.includes(dataFiltered[j].key)){
              data.push({
                  'country': dataFiltered[j].key, 
                  'suicides_pop': dataFiltered[j].value.suicides_pop,
                  'suicides_no': dataFiltered[j].value.suicides_no,
                  'population': dataFiltered[j].value.population,
                  'gdp_for_year': dataFiltered[j].value.gdp_for_year,
                  'gdp_per_capita': dataFiltered[j].value.gdp_per_capita
                });
          }
      }
      // manage case in which one or more selected states have missing data
      if(countries.length > data.length){
        for( let el in countries){
          let flag = false;
          
          for( let country in data){
            
            if(data[country]['country'] == countries[el])
              flag = true;
          }
          if(!flag){
            data.push({
              'country': countries[el], 
              'suicides_pop': 0,
              'suicides_no': 0,
              'population': 0,
              'gdp_for_year': 0,
              'gdp_per_capita': 0
            });
          }
        }
      }
  } 
  return data;  
}

// extracting max value for each feature in the selected data
function getMaxFeatures(){
  const dataFiltered = aggregateDataByCountryRadar(controller.dataMapScatter);
  
  const max_suicides_pop = d3.max(dataFiltered, d => d.value.suicides_pop );
  const max_suicides_no = d3.max(dataFiltered, d => d.value.suicides_no);
  const max_population = d3.max(dataFiltered, d => d.value.population);
  const max_gdp_for_year = d3.max(dataFiltered, d => d.value.gdp_for_year);
  const max_gdp_per_capita = d3.max(dataFiltered, d => d.value.gdp_per_capita);

  const feature_scale = {
    'suicides_pop': max_suicides_pop,
    'suicides_no': max_suicides_no,
    'population': max_population,
    'gdp_for_year': max_gdp_for_year,
    'gdp_per_capita': max_gdp_per_capita
  };
  return feature_scale;
}

// generate points
function generatePoint(length, angle){
  const point = {
    x: center.x + (length * Math.sin(offset-angle)),
    y: center.y + (length * Math.cos(offset -angle))
  }
  return point;
}

// generate and draw the path
function drawPath(points, parent){
  const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y);
  
  parent.append('path')
    .attr('d', lineGenerator(points))
    .attr('fill', 'none');
}

// generate and draw the polygon levels
function generateAndDrawLevels(levelsCount, sidesCount){
  
  for(let level = 1; level<= levelsCount; level++){
    
    const hyp = (level/levelsCount) * r_0;
    let points = [];
    
    for(let vertex = 0; vertex<sidesCount; vertex++){
      
      const theta = vertex * polyangle;
      points.push(generatePoint(hyp, theta));
    }
    const group = g.append('g')
      .attr('class', 'levels')
      .attr('fill', 'none')
      .attr('stroke', 'lightgray');
    points = points.concat(points[0]);
    
    drawPath(points, group);
  }
}

// generate and draw the lines extending from the center
function generateAndDrawLines(sidesCount){
  const group = g.append('g')
    .attr('class', 'grid-lines')
    .attr('stroke', '#377eb8');
  
  for(let vertex = 1; vertex<=sidesCount; vertex++){
    const theta = vertex * polyangle;
    var point = generatePoint(r_0, theta);
    drawPath([center, point], group);
  }
}

//function to generate ticks
function generateTicks(){
  const ticks = [];
  const step = 100/levels;
  
  for(let i=0; i<=levels; i++){
    const num = step*i;
    
    if(Number.isInteger(step)){
      ticks.push(num);
    }
    else{
      ticks.push(num.toFixed(2));
    }

  }
  return ticks;
}

// generate and draw the chart axis
function drawText( text, point, isAxis, group ){
  if ( isAxis )
  {
      //const xSpacing = text.toString().includes( "." ) ? 30 : 22;
      const xSpacing = 10;
      group.append( "text" )
          .attr( "x", point.x - xSpacing )
          .attr( "y", point.y +2 )
          .html( text )
          .style( "text-anchor", "middle" )
          .attr( "fill", "darkgrey" )
          .style( "font-size", "12px" )
          .style( "font-family", "sans-serif" )
          .style('opacity', .7);
  }
  else
  {
      group.append( "text" )
          .attr( "x", point.x )
          .attr( "y", point.y )
          .html( text )
          .style( "text-anchor", "middle" )
          .attr( "fill", "white" )
          .style( "font-size", "14px" )
          .style( "font-family", "sans-serif" )
          .style('opacity', 1);
  }

};

function drawAxis( ticks, levelsCount ){
    const groupL = g.append( "g" ).attr( "class", "tick-lines" );
    const point = generatePoint(r_0, 0);
    drawPath( [ center, point ], groupL );

    const groupT = g.append( "g" ).attr( "class", "ticks" );

    ticks.forEach( ( d, i ) =>
    {
        const r = ( i / levelsCount ) * r_0;
        const p = generatePoint(r, 0);
        const points =
            [
                p,
                {
                    ...p,
                    x: p.x -10
                }

            ];
        drawPath( points, groupL );
        drawText( d, p, true, groupT );
    } );
};

// the following two functions draw data on the radar
function drawCircles(points, color){
    g.append( "g" )
        .attr( "class", "indic" )
        .selectAll( "circle" )
        .data( points )
        .enter()
        .append( "circle" )
        .attr( "cx", center.x)
        .attr("cy", center.y)
        .attr( "r", 3 )
        .style('fill', color)
        .transition()
        .duration(700)
        .ease(d3.easeLinear)
        .attr( "cx", d => d.x )
        .attr( "cy", d => d.y );
};

const mouseOver = function (d) {
  d3.select(this)
    .style('opacity', .7);
}
const mouseOut = function(d){
  d3.select(this)
    .style('opacity', .5);
}
function drawData(dataset, n, feature_scale){

  // loop on elements of array
  for(let el in dataset){
    
    //console.log(dataset[el]);
    let points = [];
    let i = 0;
    let name = '';
    // loop on elements of dictionary
    for(let key in dataset[el]){
      //console.log(dataset[el][key]);
      
      if(key != 'country'){
        //console.log(feature_scale[key]);
        let scale = d3.scaleLinear()
          .domain([0, feature_scale[key]])
          .range([0, r_0]);
        const theta = i * ( 2 * Math.PI / n );
        const len = scale(dataset[el][key]);
        i++;
        points.push(
          {
              ...generatePoint(len, theta),
              value: dataset[el][key]
          });
      }
      else{
        drawLegendCountries(dataset[el][key], selectedColors[el], parseInt(el)+1)
        name = dataset[el][key];
      }
    }
    drawCircles(points, selectedColors[el]);
    
    // draw shapes
    let group = g.append( "g" ).attr( "class", "shape" );
    points = points.concat(points[0]);

    const areaGenerator = d3.area();
      
    const coordinates = [];
    points.forEach((d)=>{
      coordinates.push([d.x, d.y]);
    })
    const zero_coordinates = [];
    points.forEach((d) => {
      zero_coordinates.push([center.x, center.y]);
    })
    
    const zero_pathArea = areaGenerator(zero_coordinates);
    const pathArea = areaGenerator(coordinates);
    
    group.append('path')
      .attr('id', name)
      .attr('class', 'country')
      .attr('d',zero_pathArea)
      .style('fill', selectedColors[el])
      .style('opacity', .5)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .transition()
      .duration(700)
      .attr('d', pathArea);
         
  }
  for( let i = 0; i<controller.selectedCountries.length; i++){
    //console.log(svgRadar.select('#' + controller.selectedCountries[i].id));
    console.log(controller.selectedCountries[i].id);
    console.log(svgRadar.select('#' + controller.selectedCountries[i].id).style('fill'));
    console.log(map.select('#' + controller.selectedCountries[i].id));
    map
      .select('#' + controller.selectedCountries[i].id)
      .style('fill', svgRadar.select('#' + controller.selectedCountries[i].id).style('fill'));
  }
}

function drawLabels( dataset, sideCount ){
    const groupL = g.append( "g" ).attr( "class", "labels-radar" );
    for ( let vertex = 0; vertex < sideCount; vertex++ ){
        const angle = vertex * polyangle;
        const label = features[ vertex ];
        const point = generatePoint(0.9 * ( size / 2 ), angle);

        drawText( label, point, false, groupL );
    }
};

// creating and drawing countries legend
function drawLegendCountries(name, color, index){  
  
  countriesGroup
    .append("circle")
    .attr('class', 'radar-legend')
    .attr("cx", offset_legend_width + 190)
    .attr("cy", 25 + 17*index)
    .attr("r", 4)
    .style("fill", color);

  countriesGroup
    .append('text')
    .attr('class', 'radar-legend')
    .attr("x", offset_legend_width + 200)
    .attr("y", 30 + 17*index)
    .text(name)
    .style("font-size", "15px")
    .attr("alignment-baseline","middle")
    .style('fill', 'white');
}

// creating and drawing features legend
function drawLegendFeatures(features_scale){

  for( let el in features){
    
    featuresGroup
      .append('text')
      .attr('class', 'radar-legend')
      .attr("x", offset_legend_width + 180)
      .text('- ' + features[el] + ': ' + d3.format('.3s')(features_scale[features[el]]).replace('G', 'B'))
      .attr("y", offset_legend_height + 17*el)
      .style("font-size", "15px")
      .attr("alignment-baseline","middle")
      .style('fill', 'white');
  }
}