var w = document.getElementById('radar-pca').offsetWidth,
	h = document.getElementById('radar-pca').offsetHeight;

var colorscale = d3.schemeCategory10;//['#d8b365', '#f5f5f5', '#5ab4ac'];

//Legend titles
var LegendOptions = ['Smartphone','Tablet'];

//Data
var dataRadar = [];

//Options for the Radar chart, other than default
var mycfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300
}


////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

var svgRadar = d3.select('#radar-pca')
	.selectAll('svg')
	//.append('svgRadar')
	.attr("width", w+300)
	.attr("height", h)

//Create the title for the legend
var text = svgRadar.append("text")
	.attr("class", "title")
	.attr('transform', 'translate(90,0)') 
	.attr("x", w - 70)
	.attr("y", 10)
	.attr("font-size", "12px")
	.attr("fill", "#404040")
	.text("What % of owners use a specific service in a week");
		
//Initiate Legend	
var legend = svgRadar.append("g")
	.attr("class", "legend")
	.attr("height", 100)
	.attr("width", 200)
	.attr('transform', 'translate(90,20)') 
	;
	//Create colour squares
	legend.selectAll('rect')
	  .data(LegendOptions)
	  .enter()
	  .append("rect")
	  .attr("x", w - 65)
	  .attr("y", function(d, i){ return i * 20;})
	  .attr("width", 10)
	  .attr("height", 10)
	  .style("fill", function(d, i){ return colorscale(i);})
	  ;
	//Create text next to squares
	legend.selectAll('text')
	  .data(LegendOptions)
	  .enter()
	  .append("text")
	  .attr("x", w - 52)
	  .attr("y", function(d, i){ return i * 20 + 9;})
	  .attr("font-size", "11px")
	  .attr("fill", "#737373")
	  .text(function(d) { return d; })
	  ;	

function updateRadar(dataFiltered){
    var dataRadar = [];
    if(controller.selectedCountries.length > 0){
        
        countries = []
        
        for(var i = 0; i<controller.selectedCountries.length; i++){
            countries.push(controller.selectedCountries[i].id)
        }
        for (var j = 0; j<dataFiltered.length; j++){
            
            if(countries.includes(dataFiltered[j].key)){
                
                dataRadar.push([
                    {axis:'suicides ratio',value:dataFiltered[j].value.gdp_per_capita},
                    //{axis:'#suicides',value:dataFiltered[j].value.suicides_no},
                    //{axis:'population',value:dataFiltered[j].value.population},
                    {axis:'year gdp',value:dataFiltered[j].value.gdp_for_year},
                    {axis:'capita gdp',value:dataFiltered[j].value.gdp_per_capita}
                ]);
            }
        }
    } 
    
    //Call function to draw the Radar chart
    //Will expect that data is in %'s
    RadarChart.draw("#chart", dataRadar, mycfg);
}