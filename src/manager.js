Manager = function () {
    // events handlers
    this.dataLoaded = false;
    this.filteringByYear = true;
    this.listenersContainer = new EventTarget();

    // complete data
    this.dataAll = [];
    this.countryNames = new Set();
    
    // data with different filters
    this.dataYear = [];
    this.dataFiltered = [];
    this.dataMap = [];
}

Manager.prototype.loadData = function () {
    _obj = this;
    var thisYear = "1995";

    d3.csv("../data/data.csv", function (data) {
        //console.log(data)
        tmpData = []
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

        //console.log(_obj.dataAll)
        //console.log(_obj.countryNames)
        //console.log( _obj.dataFiltered)
        
        _obj.dataLoaded = true;
        _obj.listenersContainer.dispatchEvent(new Event('dataReady'))
    })
}


var manager = new Manager();
manager.loadData();
