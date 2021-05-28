Controller = function () {
    // events handlers
    this.isDataFiltered = false;  //set true when year filter applied
    this.isYearFiltered = false;  //set true when visualization filters applied
    this.appliedFilters = {}; //dictionary of applied filters
    this.listenersContainer = new EventTarget();
    this.selectedCountries = []; // max three selected countries

    // data with different filters
    this.dataAll;
    this.countryNames;
    this.dataFiltered;
    this.dataMap;
    this.dataScatter;
    this.dataSex;
    this.dataAge;

    // help
    this.colorScale;
    this.transitionTime = 1000;
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

// events dispatch
Controller.prototype.notifyAgeChanged = function () {
    this.listenersContainer.dispatchEvent(new Event('ageChanged'));
    //console.log('year changed!')
}

// events dispatch
Controller.prototype.notifySexChanged = function () {
    this.listenersContainer.dispatchEvent(new Event('sexChanged'));
    //console.log('year changed!')
}



// filter by year
Controller.prototype.triggerYearFilterEvent = function (selectedYear) {
    const appliedFilters = this.appliedFilters;

    if (isNaN(selectedYear)==true) {
        delete this.appliedFilters['year'];
        this.dataFiltered = this.dataAll; 
        this.isYearFiltered = false;  
    }
    else {
        appliedFilters['year'] = selectedYear
        this.dataFiltered = this.dataAll.filter((d) => d.year==selectedYear); 
        this.isYearFiltered = true; 
    }
        
    this.notifyYearChanged();
}


// TO FIX
// filter by age
Controller.prototype.triggerAgeFilterEvent = function (selectedAge) {
    const appliedFilters = this.appliedFilters;
    console.log(this.dataFiltered)
    console.log(selectedAge)

    appliedFilters['age'] = selectedAge //just for test
    const filter = (age) => this.dataFiltered = this.dataAll.filter((d) => d.age==age); 
    filter('75+ years') // just for test
    
    this.isDataFiltered = true; 
        
    this.notifyAgeChanged();
    console.log(this.appliedFilters)
    console.log(this.dataFiltered)
}


// filter by sex
Controller.prototype.triggerSexFilterEvent = function (selectedSex) {
    if (selectedSex == 'all') {
        this.dataFiltered = this.dataAll
    }
    else {
        const appliedFilters = this.appliedFilters;
        console.log(this.dataFiltered)
        console.log(selectedSex)
    
        appliedFilters['sex'] = selectedSex //just for test
        this.dataFiltered = this.dataAll.filter((d) => d.sex==selectedSex);
        this.isDataFiltered = true; 
            
        this.notifySexChanged();
    }

    console.log(this.appliedFilters)
    console.log(this.dataFiltered)
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
