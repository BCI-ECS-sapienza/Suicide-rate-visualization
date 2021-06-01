const makeMap = () => {

  ////////////////////////// CALLBACK //////////////////////////

  // initial fill color for country
  const fillCountryColor = function (d) {
    if(typeof(data.get(nameMap(d))) === "undefined"){
      d.total = 'Missing data';
      return '#DCDCDC'; 
    }
    else{
      d.total = data.get(nameMap(d));
      return colorScale(d.total);
    }        
  }

  // callback for mouseover country
  const mouseOver = function (d) {
    const selectedCountries = controller.selectedCountries;

    d3.select(this)
      .style("fill", fillColorMap)
      .style("cursor", "pointer")
      .style('opacity', maxOpacity)
      .style("cursor", "pointer");
    
    // show tooltip
    tooltipMap
      .transition()
      .duration(controller.transitionTime)
    
    tooltipMap
      .style("opacity", 1)
      .html(
        '<b>Country:</b> ' + nameMap(d) + 
        '<br><b>Suicide ratio:</b> ' + totalMap(d))
      .style("left", (d3.mouse(this)[0]) + "px")   
      .style("top", (d3.mouse(this)[1]) + "px");

    // manage circles on scatterPlot
    const id = '#' + nameMap(d);
    d3.select('#scatterPlot')
      .select(id)
      .attr("r", scatter_selected_circle_size )
      .classed('over-object', true)
  }

  // callback for mouseMove country
  const mouseMove = function (d) {
    tooltipMap
      .style("opacity", maxOpacity)
      .html(
        '<b>Country:</b> ' + nameMap(d) + 
        '<br><b>Suicide ratio:</b> ' + totalMap(d))
      .style("left", (d3.mouse(this)[0]) + "px")   
      .style("top", (d3.mouse(this)[1]) + "px");
  }

  // callback for mouseOut country
  const mouseOut = function(d){
    const selectedCountries = controller.selectedCountries;

    d3.select(this)
      .classed('over-object', false)
      .style("fill", (d)=>{
        if(d.total === "Missing data") 
          return '#DCDCDC';
        else{
          return colorScale(d.total);
        }
      })
      .style('opacity', () => {
        if(controller.selectedCountries.length != 0){
          var flag = false;
          for(var i = 0; i<selectedCountries.length; i++){
            
            if(selectedCountries[i].id == this.id)
              flag = true;
          }          
          if(!flag){
              return minOpacity;
          }
          else{
            return maxOpacity;
          }
        }
        else{
          return maxOpacity;
        }
      });

    tooltipMap
      .transition()
      .duration(250)
      .style("opacity", 0);

    // manage circles on scatterPlot
    const id = '#' + nameMap(d);
    d3.select('#scatterPlot')
      .select(id)
      .attr("r", scatter_circle_size )
      .classed('over-object', false)
  }

  // callback for mouseClick country
  const mouseClick = function(d){
    const selectedCountries = controller.selectedCountries;
        
    if(selectedCountries.includes(this)){
      const index = selectedCountries.indexOf(this);
      d3.select(this)
      .style("stroke", 'transparent');
      //.style('opacity', minOpacity);

      if (index > -1) {
        selectedCountries.splice(index, 1);
      } 
      
      if(selectedCountries.length == 0){
        //svgPca
          //.attr("opacity", 1);
        map
          .selectAll('path')
          .style('opacity', maxOpacity);
        svgRadar
          .attr("opacity", 0);
        controller.isCountryMapSelected = false;
      }
      if(firstAdded === this && selectedCountries.length != 0){
        firstAdded = selectedCountries[0];

        for(var i = 0; i<selectedCountries.length; i++){
          d3.select('#map-holder')
            .select('#' + selectedCountries[i].id)
            .style('stroke', strokeColorMap)
            .style('opacity', maxOpacity);
        };
      }
    }
    else{
      if(selectedCountries.length < 3){
        if(selectedCountries.length == 0){
          firstAdded = this;
          map
            .selectAll('path')
            .style('opacity', minOpacity);
        }
        selectedCountries.push(this);
      }
      else{
        const index = selectedCountries.indexOf(firstAdded);
        if (index > -1) {
          selectedCountries.splice(index, 1);
        }
        
        console.log(firstAdded.id);

        d3.select('#map-holder')
          .select('#' + firstAdded.id)
          .style('stroke', 'transparent')
          .style('opacity', minOpacity);

        firstAdded = selectedCountries[0];

        selectedCountries.push(this);
      }          
      //svgPca
        //.attr("opacity", 0);  
      svgRadar
        .attr("opacity", 1);
      controller.isCountryMapSelected = true;

      for(var i = 0; i<selectedCountries.length; i++){
        d3.select('#map-holder')
          .select('#' + selectedCountries[i].id)
          .style('stroke', strokeColorMap)
          .style('opacity', maxOpacity);
      };
    }
    //console.log(controller.isCountryMapSelected);
    drawRadar(dataYear);  

    
    // trigger filter for bars values (if empty go back to all countries)
    let selectedPoints = [];
    if (selectedCountries.length > 0) 
      selectedCountries.forEach((country) => selectedPoints.push({key: country.id} ));
    else 
      selectedPoints = aggregateDataByCountry(controller.dataYear);
    
    controller.triggerMapFilterEvent(selectedPoints);
  }



  ////////////////////////// SETUP //////////////////////////

  // get data
  const dataYear = aggregateDataByCountryRadar(controller.dataAll);
  const dataFiltered = aggregateDataByCountry(controller.dataMapScatter);
  const colorScale = controller.colorScale;

  // extract values for colorScale
  const data = d3.map();
  for (var i = 0; i<dataFiltered.length; i++){
    data.set(dataFiltered[i].key, +dataFiltered[i].value.suicides_pop, dataFiltered[i].value.suicides_no, +dataFiltered[i].value.gdp_for_year,
      +dataFiltered[i].value.gdp_per_capita);
  }    

  // add zoom
  d3.select('#map-holder').call(zoomMap);

  ////////////////////////// INITIALIZE MAP //////////////////////////

  d3.json(geoJsonUrl, function(json) {

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
      .attr("fill", fillCountryColor)
      .style("stroke", "transparent")
      .attr("id", function(d){ return nameMap(d); })
      .attr("class", "Country")
      .style("opacity", maxOpacity)
      .on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseout", mouseOut)
      .on("click", mouseClick);

  });   
}


////////////////////////// UPDATE FUNCTIONS //////////////////////////

function updateMap() {
  map.selectAll('g')
  .remove()
  .exit();

  d3.select('#map-holder')
  .selectAll('tooltipMap-scatter')
  .remove()
  .exit();

  makeMap()  
}

