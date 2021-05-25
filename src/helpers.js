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

