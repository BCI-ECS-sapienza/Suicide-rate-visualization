// Width and Height of the whole visualization
var width = document.getElementById('radar-pca').offsetWidth;
var height = document.getElementById('radar-pca').offsetHeight;

// svg
var svgRadar = d3.select("#radar-pca").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("opacity", 0);
    
// set parameters
var features = ['population', 'year gdp', 'capita gdp', 'suicides ratio', '#suicides']
var colors = ['#d8b365', '#f5f5f5', '#5ab4ac'];

setRadar();

function updateRadar(dataFiltered){   
    var data = [];
    if(controller.selectedCountries.length > 0){
        countries = []
        for(var i = 0; i<controller.selectedCountries.length; i++){
            countries.push(controller.selectedCountries[i].id)
        }
        for (var j = 0; j<dataFiltered.length; j++){
            if(countries.includes(dataFiltered[j].key)){
                
                data.push([
                    {axis:'suicides ratio',value:dataFiltered[j].value.gdp_per_capita},
                    //{axis:'#suicides',value:dataFiltered[j].value.suicides_no},
                    //{axis:'population',value:dataFiltered[j].value.population},
                    {axis:'year gdp',value:dataFiltered[j].value.gdp_for_year},
                    {axis:'capita gdp',value:dataFiltered[j].value.gdp_per_capita}
                ]);
            }
        }
    } 
    console.log(data);  
}

function setRadar(){
    var dataRadar = [];
    //var features = ["A","B","C","D","E","F"];
    //generate the dataRadar
    for (var i = 0; i < 3; i++){
        var point = {}
        //each feature will be a random number from 1-9
        features.forEach(f => point[f] = 1 + Math.random() * 8);
        dataRadar.push(point);
    }

    // Plotting the gridlines
    var radialScale = d3.scaleLinear()
        .domain([0,10])
        .range([0,115]);
    var ticks = [2,4,6,8,10];

    // Add circles
    ticks.forEach(t =>
    svgRadar.append("circle")
        .attr("cx", width/2)
        .attr("cy", height/2)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", radialScale(t))
    );

    // tick labels
    ticks.forEach(t =>
    svgRadar.append("text")
        .attr("x", width/2+5)
        .attr("y", height/2 - radialScale(t))
        .text(t.toString())
        .style("font-size", "10px")
        .style("fill", "gray")
    );

    // Plotting the axes
    function angleToCoordinate(angle, value){
    var x = Math.cos(angle) * radialScale(value);
    var y = Math.sin(angle) * radialScale(value);
    return {"x": width/2 + x, "y": height/2 - y};
    }

    for (var i = 0; i < features.length; i++) {
    var ft_name = features[i];
    var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    var line_coordinate = angleToCoordinate(angle, 10);
    var label_coordinate = angleToCoordinate(angle, 10.5);

    //draw axis line
    svgRadar.append("line")
        .attr("x1", width/2)
        .attr("y1", height/2)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .attr("stroke","gray");

    //draw axis label
    svgRadar.append("text")
        .attr("x", label_coordinate.x)
        .attr("y", label_coordinate.y)
        .text(ft_name)
        .style("fill", "gray");
    }

    // Plotting dataRadar
    var line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
        

    function getPathCoordinates(dataRadar_point){
    var coordinates = [];
    for (var i = 0; i < features.length; i++){
        var ft_name = features[i];
        var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, dataRadar_point[ft_name]));
    }
    return coordinates;
    }

    for (var i = 0; i < dataRadar.length; i ++){
    let d = dataRadar[i];
    let color = colors[i];
    let coordinates = getPathCoordinates(d);

    //draw the path element
    svgRadar.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5);
    }
}