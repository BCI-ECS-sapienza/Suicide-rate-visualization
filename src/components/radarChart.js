// define parameters
const sides = 5;
const levels = 4;
const horizontal_margin = 40;
const vertical_margin = 10;

let width = document.getElementById('radar-pca').offsetWidth + horizontal_margin;
let height = document.getElementById('radar-pca').offsetHeight + vertical_margin;

let size = Math.min(width, height);

const offset = Math.PI;
const polyangle = (Math.PI*2)/sides;
let r = 0.8 * size;
let r_0 = r/2;
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
const selectedColors = ['#d8b365',
  '#f5f5f5',
  '#5ab4ac'];

const ticks = generateTicks(levels);

// define svg 
const svgRadar = d3.select('#radar-pca')
    .append('svg')
    .attr('opacity', 0)
    .attr('width', width)
    .attr('height', height)
    .attr("transform", "translate(-" + 2*horizontal_margin + "," + vertical_margin + ")");

const g = svgRadar.append('g');

// countried legend heading
const countriesGroup = svgRadar.append('g');
countriesGroup
  .append('text')
  .attr('class', 'radar-heading-legend')
  .attr("x", (width/2 + 150))
  .attr("y", 20)
  .text("Countries:")
  .style("font-size", "15px")
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
function drawRadar(dataYear){
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
  let features_scale = getMaxFeatures();
  drawPath(points, g);
  generateAndDrawLevels(levels, sides);
  generateAndDrawLines(sides);
  drawAxis(ticks, levels);
  data = getData(dataYear);
  drawData(data, sides, features_scale);
  drawLabels(data, sides);
  drawLegendFeatures(features_scale);
}

// define functions called above
// function to get data
function getData(dataYear){ 
  let data = [];  
  if(controller.selectedCountries.length > 0){
      countries = []
      
      for(let i = 0; i<controller.selectedCountries.length; i++){
          countries.push(controller.selectedCountries[i].id)
      }
      
      for (let j = 0; j<dataYear.length; j++){
          if(countries.includes(dataYear[j].key)){
              data.push({
                  'country': dataYear[j].key, 
                  'suicides_pop': dataYear[j].value.suicides_pop,
                  'suicides_no': dataYear[j].value.suicides_no,
                  'population': dataYear[j].value.population,
                  'gdp_for_year': dataYear[j].value.gdp_for_year,
                  'gdp_per_capita': dataYear[j].value.gdp_per_capita
                });
          }
      }
  } 
  return data;  
}

// extracting max value for each feature in the selected data
function getMaxFeatures(){
  const dataYear = aggregateDataByCountryRadar(controller.dataAll);
  
  const max_suicides_pop = d3.max(dataYear, d => d.value.suicides_pop );
  const max_suicides_no = d3.max(dataYear, d => d.value.suicides_no);
  const max_population = d3.max(dataYear, d => d.value.population);
  const max_gdp_for_year = d3.max(dataYear, d => d.value.gdp_for_year);
  const max_gdp_per_capita = d3.max(dataYear, d => d.value.gdp_per_capita);

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
    .attr('stroke', 'lightgreen');
  
  for(let vertex = 1; vertex<=sidesCount; vertex++){
    const theta = vertex * polyangle;
    var point = generatePoint(r_0, theta);
    drawPath([center, point], group);
  }
}
/////////////////////////////////////////////////////////
//////////////// NEVER CALLED////////////////////////////
/////////////////////////////////////////////////////////

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
          .attr( "y", point.y - 3 )
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
          .attr( "fill", "darkgrey" )
          .style( "font-size", "12px" )
          .style( "font-family", "sans-serif" )
          .style('opacity', .7);
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
        .attr( "cx", d => d.x )
        .attr( "cy", d => d.y )
        .attr( "r", 3 )
        .style('fill', color);
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
      }
    }
    let group = g.append( "g" ).attr( "class", "shape" );
    
    points = points.concat(points[0]);
    
    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y);
  
    group.append('path')
      .attr('d', lineGenerator(points))
      .attr('fill', selectedColors[el])
      .style('opacity', .5)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut);
    drawCircles(points, selectedColors[el]);
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
    .attr("cx", width/2 + 155)
    .attr("cy", 25 + 12*index)
    .attr("r", 4)
    .style("fill", color);

  countriesGroup
    .append('text')
    .attr('class', 'radar-legend')
    .attr("x", width/2 + 165)
    .attr("y", 30 + 12*index)
    .text(name)
    .style("font-size", "12px")
    .attr("alignment-baseline","middle")
    .style('fill', 'white');
}

// creating and drawing features legend
function drawLegendFeatures(features_scale){
  const featuresGroup = svgRadar.append('g');
  featuresGroup
  .append('text')
  .attr('class', 'radar-heading-legend')
  .attr("x", (width/2 + 150))
  .attr("y", height/2 - 15)
  .text("Features max:")
  .style("font-size", "15px")
  .attr("alignment-baseline","middle")
  .style('fill', 'white');

  for( let el in features){
    
    featuresGroup
      .append('text')
      .attr('class', 'radar-legend')
      .attr("x", width/2 + 150)
      .text(features[el] + ': ' + features_scale[features[el]])
      .attr("y", (height/2) + 12*el)
      .style("font-size", "11px")
      .attr("alignment-baseline","middle")
      .style('fill', 'white');
    /*featuresGroup
      .append('text')
      .attr('class', 'radar-legend')
      .attr("x", width/2 + 200)
      .text(features_scale[features[el]])
      .attr("y", (height/2) + 12*el)
      .style("font-size", "11px")
      .attr("alignment-baseline","middle")
      .style('fill', 'white');*/
  }
}