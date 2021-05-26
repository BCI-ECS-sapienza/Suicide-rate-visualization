Controller = function () {
    // events handlers
    this.isDataFiltered = false;  //set true when visualization filters applied
    this.appliedFilters = {'age':'05-20'}; //dictionary of applied filters
    this.listenersContainer = new EventTarget();

    // data with different filters
    this.dataAll;
    this.countryNames;
    this.dataFiltered;

    // help
    this.colorScale
}


Controller.prototype.loadData = function () {
    _obj = this;
    suicideColorScale = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']; //all color scales from https://colorbrewer2.org/

    d3.csv("../data/data.csv", parseRow, function (data) {
        //console.log("data loading...")

        countries = new Set();
        data.forEach(d => {
            countries.add(d.country)      
        });

        // save data 
        _obj.dataAll = data;
        _obj.dataFiltered = data;
        _obj.countryNames = countries;

        //console.log(_obj.dataAll)
        //console.log(_obj.countryNames)
        //console.log( _obj.dataYear)
        //console.log( _obj.dataFiltered)
        //console.log("data loaded!")  

        // set suicide colorScale
        const colorValueScale = d => d.suicides_pop;
        _obj.colorScale = d3.scaleQuantile()
            .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, d3.max(data, colorValueScale)])
            .range(suicideColorScale)

        // draw graphs
        makeMap(_obj.colorScale);
        makeLegend(_obj.colorScale);
        makeScatterPlot(_obj.colorScale);  
        makeSexChart(_obj.colorScale);
        makeAgeChart(_obj.colorScale);
    });
}


// custom listener
Controller.prototype.addListener = function (nameEvent, action) {
    this.listenersContainer.addEventListener(nameEvent, action);
}

// events dispatch
Controller.prototype.notifyYearChanged = function () {
    this.listenersContainer.dispatchEvent(new Event('yearChanged'));
    //console.log('year changed!')
}


// filter by yar
Controller.prototype.triggerYearFilterEvent = function (selectedYear) {
    const appliedFilters = this.appliedFilters;

    if (isNaN(selectedYear)==true) {
        delete this.appliedFilters['year'];
        this.dataFiltered = this.dataAll;
        //this.dataFiltered = this.dataAll.filter((d) => d.year==selectedYear);
        this.isDataFiltered = false;
    }
    else {
        appliedFilters['year'] = selectedYear
        this.dataFiltered = this.dataAll.filter((d) => d.year==selectedYear); 
        this.isDataFiltered = true; 
    }
        
    this.notifyYearChanged();
    console.log(this.appliedFilters)
}


// data rows parser
const parseRow = (d) => {
    d.year = +d.year;
    d.suicides_no = +d.suicides_no;
    d.population =  +d.population;
    d.suicides_pop = +d.suicides_pop;
    d.gdp_for_year = +d.gdp_for_year;
    d.gdp_per_capita = +d.gdp_per_capita;
    return d;
};


const controller = new Controller();
controller.loadData();
