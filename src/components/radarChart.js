// define variables
var sides = 5;
var levels = 4;

var width = document.getElementById('radar-pca').offsetWidth;
var height = document.getElementById('radar-pca').offsetHeight;

var size = Math.min(width, height);

var offset = Math.PI;
var polyangle = (Math.PI*2)/sides;
var r = 0.8 * size;
var r_0 = r/2;

var center = {
  x: width/2,
  y: height/2
}

var features = ['Country', 
    'suicides ratio',
    '#suicides',
    'population',
    'year gdp',
    'capita gdp'
  ];

var ticks = generateTicks(levels);

var scale = d3.scaleLinear()
  .domain([0,100])
  .range([0, r_0]);

// define svg 
var svgRadar = d3.select('#radar-pca')
    .append('svg')
    //.attr('opacity', 0)
    .attr('width', width)
    .attr('height', height);

var g = svgRadar.append('g');

// generate all the vertices of our polygon
var points = [];
var length = 100;
for (var vertex = 0; vertex<sides; vertex++){
  var theta = vertex * polyangle;
  points.push(generatePoint(length, theta));
}
points = points.concat(points[0]);


// draw the graph with data
function drawRadar(dataYear){
  
  drawPath(points, g);
  generateAndDrawLevels(levels, sides);
  generateAndDrawLines(sides);
  drawAxis(ticks, levels);
  data = getData(dataYear);
  //console.log(data);
  //drawData(data, sides);
}

// define functions called above
// function to get data
function getData(dataYear){ 
  var data = [];  
  if(controller.selectedCountries.length > 0){
      countries = []
      
      for(var i = 0; i<controller.selectedCountries.length; i++){
          countries.push(controller.selectedCountries[i].id)
      }
      
      for (var j = 0; j<dataYear.length; j++){
          if(countries.includes(dataYear[j].key)){
              data.push([{
                  'Country': dataYear[j].key, 
                  'suicides ratio': dataYear[j].value.suicides_pop,
                  '#suicides': dataYear[j].value.suicides_no,
                  'population': dataYear[j].value.population,
                  'year gdp': dataYear[j].value.gdp_for_year,
                  'capita gdp': dataYear[j].value.gdp_per_capita
                }]);
          }
      }
  } 
  return data;  
}

// generate points
function generatePoint(length, angle){
  var point = {
    x: center.x + (length * Math.sin(offset-angle)),
    y: center.y + (length * Math.cos(offset -angle))
  }
  return point;
}

// generate and draw the path
function drawPath(points, parent){
  var lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y);
  
  parent.append('path')
    .attr('d', lineGenerator(points))
    .attr('fill', 'none');
}

// generate and draw the polygon levels
function generateAndDrawLevels(levelsCount, sidesCount){
  
  for(var level = 1; level<= levelsCount; level++){
    
    var hyp = (level/levelsCount) * r_0;
    var points = [];
    
    for(var vertex = 0; vertex<sidesCount; vertex++){
      
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
  var group = g.append('g')
    .attr('class', 'grid-lines')
    .attr('stroke', 'lightgreen');
  
  for(var vertex = 1; vertex<=sidesCount; vertex++){
    var theta = vertex * polyangle;
    var point = generatePoint(r_0, theta);
    drawPath([center, point], group);
  }
}
// NOTE: for now never called
function generateTicks(){
  const ticks = [];
  var step = 100/levels;
  
  for(var i=0; i<=levels; i++){
    var num = step*i;
    
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
      //var xSpacing = text.toString().includes( "." ) ? 30 : 22;
      var xSpacing = 10;
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
    var groupL = g.append( "g" ).attr( "class", "tick-lines" );
    var point = generatePoint(r_0, 0);
    drawPath( [ center, point ], groupL );

    var groupT = g.append( "g" ).attr( "class", "ticks" );

    ticks.forEach( ( d, i ) =>
    {
        var r = ( i / levelsCount ) * r_0;
        var p = generatePoint(r, 0);
        var points =
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
function drawCircles(points){
    g.append( "g" )
        .attr( "class", "indic" )
        .selectAll( "circle" )
        .data( points )
        .enter()
        .append( "circle" )
        .attr( "cx", d => d.x )
        .attr( "cy", d => d.y )
        .attr( "r", 8 );
};

function drawData(dataset, n ){
    var points = [];
    dataset.forEach( ( d, i ) => 
    {
        var len = scale( d.value );
        var theta = i * ( 2 * Math.PI / n );

        points.push(
            {
                ...generatePoint(len, theta),
                value: d.value
            } );
    } );

    var group = g.append( "g" ).attr( "class", "shape" );

    drawPath( [ ...points, points[ 0 ] ], group );
    drawCircles( points );
};