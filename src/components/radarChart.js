// Width and Height of the whole visualization
var width = document.getElementById('radarChart').offsetWidth;
var height = document.getElementById('radarChart').offsetHeight;

var data = [];
var features = ["A","B","C","D","E","F"];
//generate the data
for (var i = 0; i < 3; i++){
    var point = {}
    //each feature will be a random number from 1-9
    features.forEach(f => point[f] = 1 + Math.random() * 8);
    data.push(point);
}

// svg
var svgRadar = d3.select("#radarChart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height);

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

// Plotting data
var line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
var colors = ["darkorange", "gray", "navy"];

function getPathCoordinates(data_point){
    var coordinates = [];
    for (var i = 0; i < features.length; i++){
        var ft_name = features[i];
        var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}

for (var i = 0; i < data.length; i ++){
    let d = data[i];
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