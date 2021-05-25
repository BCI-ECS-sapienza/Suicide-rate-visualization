// format axis with 3 numbers and change bilions encoding
const AxisTickFormat = number =>
  	d3.format('.2s')(number).replace('G', 'B');


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
        gdp_for_year: d[0].gdp_for_year,    // same for each category
        gdp_per_capita: d[0].gdp_per_capita
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