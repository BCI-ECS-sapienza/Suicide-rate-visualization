Controller = function () {
    // events handlers
    this.dataLoaded = false;
    this.isDataFiltered = true;  //set true when visualization filters applied
    this.listenersContainer = new EventTarget();

    // complete data
    this.dataAll;
    this.countryNames;
    
    // data with different filters
    this.dataYear;
    this.dataFiltered;
    this.dataMap;

    // help vars
    this.suicideColorScale = ['#fee0d2','#fc9272','#de2d26']; //from https://colorbrewer2.org/
}

Controller.prototype.loadData = function () {
    _obj = this;
    const thisYear = 2000;

    d3.csv("../data/data.csv", parseRow, function (data) {
        //console.log("data loading...")
        tmpData = [];
        countries = new Set();

        data.forEach(d => {
            if (d.year == thisYear) tmpData.push(d);  
            countries.add(d.country)      
        });

        _obj.dataAll = data;
        _obj.countryNames = countries;

        _obj.dataYear = tmpData;
        _obj.dataFiltered = tmpData;
        _obj.dataMap = tmpData;

        //console.log(_obj.dataAll)
        //console.log(_obj.countryNames)
        //console.log( _obj.dataFiltered)
    
        //console.log("data loaded!")
        _obj.dataLoaded = true;       
        _obj.listenersContainer.dispatchEvent(new Event('dataLoaded'))   
    });
}


// custom listener
Controller.prototype.addListener = function (nameEvent, action) {
    if (this.dataLoaded && nameEvent == 'dataLoaded') action();
    else this.listenersContainer.addEventListener(nameEvent, action);
}


// data accessors
Controller.prototype.getDataAll = function () {
    return this.dataAll;
}

Controller.prototype.getDataYear = function () {
    return this.dataYear;
}

Controller.prototype.getDataFiltered = function () {
    if (this.dataFiltered == undefined) return this.dataYear;
    return this.dataFiltered;
}


Controller.prototype.getSuicideColorScale = function () {
    return this.suicideColorScale;
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
