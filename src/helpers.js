// format axis with 3 numbers and change bilions encoding
const AxisTickFormat = number =>
  	d3.format('.2s')(number).replace('G', 'B');

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