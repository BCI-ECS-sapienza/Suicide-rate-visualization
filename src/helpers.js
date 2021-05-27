// format axis with 3 numbers and change bilions encoding
const AxisTickFormat = number =>
  	d3.format('.2s')(number).replace('G', 'B');

// sum values inside set
const sumSet = mySet => [...mySet].reduce((a,b) => a + b, 0)



// year filter from header
const yearSelected = () => {
    const yearSelector = document.getElementById("year-selector");
    const selectedYear = yearSelector.options[yearSelector.selectedIndex].value;
    //console.log(selectedYear)
    controller.triggerYearFilterEvent(selectedYear);
};




// data aggregators
const aggregateDataByCountry = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.country)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
        gdp_for_year: Math.round(d3.mean(d, (g) => g.gdp_for_year)),    
        gdp_per_capita: Math.round(d3.mean(d, (g) => g.gdp_per_capita))
      }))
    .entries(dataIn)
    return data;
};

const aggregateDataByAge = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.age)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      }))
    .entries(dataIn)
    return data;
  };

const aggregateDataBySex = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.sex)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      }))
    .entries(dataIn)
    return data;
  };




// functions to print avg lines
const printAvgY = (svg, avg_value_y, avg_value_scaled_y, width) => {
  // add avg line y
  svg.append("line")
      .transition()
      .duration(controller.avgTransitionTime)
      .attr('class', 'avg-line')
      .attr("x1", 0)
      .attr("x2", width+2)
      .attr("y1", avg_value_scaled_y)
      .attr("y2", avg_value_scaled_y)

  // avg value print for y
  svg.append("text")
      .transition()
      .duration(controller.avgTransitionTime)
      .attr('class', 'avg-label')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width-20}, ${avg_value_scaled_y-10})`) 
      .text(d3.format('.2s')(avg_value_y))
}

const printAvgX = (svg, avg_value_x, avg_value_scaled_x, height) => {
  // add avg line x
  svg.append("line")
      .transition()
      .duration(controller.avgTransitionTime)
      .attr('class', 'avg-line')
      .attr("x1", avg_value_scaled_x)
      .attr("x2", avg_value_scaled_x)
      .attr("y1", 0)
      .attr("y2", height+2)

  // avg value print for x
  svg.append("text")
      .transition()
      .duration(controller.avgTransitionTime)
      .attr('class', 'avg-label')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${avg_value_scaled_x+25}, ${20})`) 
      .text(d3.format('.2s')(avg_value_x).replace('G', 'B'))
}
