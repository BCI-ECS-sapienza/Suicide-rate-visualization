Controller = function () {
    // events handlers
    this.isDataFiltered = false;  //set true when visualization filters applied
    this.appliedFilters = {'age':'05-20'}; //dictionary of applied filters
    this.listenersContainer = new EventTarget();

    // data with different filters
    this.dataAll;
    this.countryNames;
    this.dataFiltered;

    // help vars
    this.suicideColorScale = ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']; //all color scales from https://colorbrewer2.org/
}


Controller.prototype.loadData = function () {
    _obj = this;

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

        // draw graphs
        makeMap();
        makeLegend();
        makeScatterPlot();  
        makeSexChart();
        makeAgeChart();
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
