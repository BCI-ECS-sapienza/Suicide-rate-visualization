Controller = function () {
    // events handlers
    this.isYearFiltered = false;  //set true when visualization filters applied
    this.listenersContainer = new EventTarget();
    this.selectedCountries = []; // max three selected countries

    // applied filters
    this.sexFilter = 'all';
    this.ageFilter = new Set();
    this.scatterFilter = [];

    // data with different filters, one for each visualization
    this.dataAll;
    this.dataYear;
    this.dataMapScatter;
    this.dataSex;
    this.dataAge;
    this.countryNames;

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
        _obj.dataYear = data;
        _obj.dataMapScatter = data;
        _obj.dataSex = data;
        _obj.dataAge = data;
        _obj.countryNames = countries;

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
Controller.prototype.notifyYearFiltered = function () {
    this.listenersContainer.dispatchEvent(new Event('yearFiltered'));
    //console.log('year changed!')
}

Controller.prototype.notifyScatterFiltered = function () {
    this.listenersContainer.dispatchEvent(new Event('scatterFiltered'));
    console.log('GPD filtered!')
}

Controller.prototype.notifySexFiltered = function () {
    this.listenersContainer.dispatchEvent(new Event('sexFiltered'));
    //console.log('sex filtered!')
}

Controller.prototype.notifyAgeFiltered = function () {
    this.listenersContainer.dispatchEvent(new Event('ageFiltered'));
    //console.log('age filtered!')
}





// filter by year
Controller.prototype.triggerYearFilterEvent = function (selectedYear) {

    if (isNaN(selectedYear)==true) {
        this.dataYear = this.dataAll;
        this.dataMapScatter = this.dataAll;
        this.dataSex = this.dataAll;
        this.dataAge = this.dataAll;
        this.isYearFiltered = false;  

    } else {
        dataFiltered = this.dataAll.filter((d) => d.year==selectedYear); 
        this.dataYear = dataFiltered;
        this.dataMapScatter = dataFiltered;
        this.dataSex = dataFiltered;
        this.dataAge = dataFiltered
        this.isYearFiltered = true; 
    }
        
    this.notifyYearFiltered();
}


// filter by scatter
Controller.prototype.triggerScatterFilterEvent = function (selectedPoints) {
    this.scatterFilter = selectedPoints;
    this.globalFilter();
    this.notifyScatterFiltered();
}

// filter by sex
Controller.prototype.triggerSexFilterEvent = function (selectedSex) {
    this.sexFilter = selectedSex;
    this.globalFilter();
    this.notifySexFiltered();
}

// filter by age
Controller.prototype.triggerAgeFilterEvent = function (selectedAge) {
    this.ageFilter = selectedAge;
    this.globalFilter();
    this.notifyAgeFiltered();
}



// global filter 
Controller.prototype.globalFilter = function () {
    let dataMapScatter = this.dataYear;
    let dataSex = this.dataYear;
    let dataAge = this.dataYear;

    // put scatter
    // if nothing selected (arr empty) return dataYear
    // else get only points selected by scatter
    console.log(this.scatterFilter)
    
    // filter sex first (that is boolean) (not for dataSex)
    const sexFilter = this.sexFilter
    if (sexFilter != 'all') {
        dataMapScatter = this.dataYear.filter((d) => d.sex==sexFilter);
        dataAge = this.dataYear.filter((d) => d.sex==sexFilter);
        dataSex = this.dataYear;    // do not delete other sex data!!
    }

    // filter age (not for dataAge)
    const ageFilterArray = this.ageFilter;
    if (ageFilterArray.size > 0) {

        let tmpData = []
        // for each age selected take all corresponding data d
        ageFilterArray.forEach((ageFilter) => {
            dataMapScatter.forEach(d => {
                if (d.age==ageFilter) tmpData.push(d);
            });
        })
        
        dataMapScatter = tmpData;
        dataSex = tmpData;
        //dataAge = already updated sex    // do not delete other ages data!!
    }
    
 
    //console.log(sexFilter)
    //console.log(ageFilterArray)

    // put new values 
    this.dataMapScatter = dataMapScatter;
    this.dataSex = dataSex;
    this.dataAge = dataAge;
}


const controller = new Controller();
controller.loadData();
