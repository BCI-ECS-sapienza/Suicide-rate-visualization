// define parameters
const sides = 5;
const levels = 4;

let width = document.getElementById('radar-pca').offsetWidth;
let height = document.getElementById('radar-pca').offsetHeight;

let size = Math.min(width, height);

const offset = Math.PI;
const polyangle = (Math.PI*2)/sides;
let r = 0.8 * size;
let r_0 = r/2;

let center = {
  x: width/2,
  y: height/2
}
const selectedColors = ['#d01c8b',
    '#f1b6da',
    '#b8e186',
    '#4dac26'];

const ticks = generateTicks(levels);

// define svg 
const svgRadar = d3.select('#radar-pca')
    .append('svg')
    .attr('opacity', 0)
    .attr('width', width)
    .attr('height', height);

const g = svgRadar.append('g');

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

  let feature_scale = getMaxFeatures();
  drawPath(points, g);
  generateAndDrawLevels(levels, sides);
  generateAndDrawLines(sides);
  drawAxis(ticks, levels);
  data = getData(dataYear);
  drawData(data, sides, feature_scale);
  
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
                  'suicides ratio': dataYear[j].value.suicides_pop,
                  '#suicides': dataYear[j].value.suicides_no,
                  'population': dataYear[j].value.population,
                  'year_gdp': dataYear[j].value.gdp_for_year,
                  'capita_gdp': dataYear[j].value.gdp_per_capita
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
    'suicides ratio': max_suicides_pop,
    '#suicides': max_suicides_no,
    'population': max_population,
    'year_gdp': max_gdp_for_year,
    'capita_gdp': max_gdp_per_capita
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
// NOTE: for now never called
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

// draw data
function drawCircles(points, color){
    g.append( "g" )
        .attr( "class", "indic" )
        .selectAll( "circle" )
        .data( points )
        .enter()
        .append( "circle" )
        .attr( "cx", d => d.x )
        .attr( "cy", d => d.y )
        .attr( "r", 4 )
        .style('fill', color);
};

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
    }
    let group = g.append( "g" ).attr( "class", "shape" );
    
    points = points.concat(points[0]);
    
    drawPath(points, group);
    drawCircles(points, selectedColors[el]);
  }
}

function updateRadar(dataYear) {
  svgRadar.selectAll('circle')
  .remove()
  .exit();
}