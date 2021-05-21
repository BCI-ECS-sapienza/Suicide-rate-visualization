Controller = function () {
    // events handlers
    this.dataLoaded = false;
    this.listenersContainer = new EventTarget();

    // complete data
    this.dataAll = [];
    this.countryNames = new Set();
    
    // data with different filters
    this.dataYear = [];
    this.dataFiltered = [];
    this.dataMap = [];
}

Controller.prototype.loadData = function () {
    _obj = this;
    const thisYear = 2015;

    d3.csv("../data/data.csv", parseRow, function (data) {
        console.log("data loading...")
        tmpData = [];
        countries = new Set();

        data.forEach(d => {
            if (d.year == thisYear) tmpData.push(d);  
            countries.add(d.country)      
        });

        _obj.dataAll = data;
        _obj.countryNames = countries;

        _obj.dataFiltered = tmpData;
        _obj.dataYear = tmpData;
        _obj.dataMap = tmpData;

        console.log(_obj.dataAll)
        console.log(_obj.countryNames)
        console.log( _obj.dataFiltered)
    
        _obj.dataLoaded = true;
        _obj.listenersContainer.dispatchEvent(new Event('dataReady'))
        console.log("data loaded!")
    });
}


// custom listener
Controller.prototype.addListener = function (nameEvent, action) {
    if (this.dataLoaded && nameEvent == 'dataReady') action();
    else this.listenersContainer.addEventListener(nameEvent, action());
}


// data accessors
Controller.prototype.getDataAll = function () {
    return this.dataAll;
}

Controller.prototype.getDataFiltered = function () {
    return this.dataFiltered;
}



// helpers
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
