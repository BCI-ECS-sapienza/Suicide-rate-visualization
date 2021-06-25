// chart static params
const initial_width_pca = document.getElementById('pca').offsetWidth;
const initial_height_pca = document.getElementById('pca').offsetHeight;
const pca_xLabel = 'PCA 1';;
const pca_yLabel = 'PCA 2';
const pca_circle_size = 6;
const pca_selected_circle_size = 10;
const pca_transition_time = 1000;
const pca_points_delay = 12;

// set the dimensions and margins of the graph
const margin_pca = {top: 25, right: 30, bottom: 55, left: 80},
    width_pca = initial_width_pca - margin_pca.left - margin_pca.right,
    height_pca = initial_height_pca - margin_pca.top - margin_pca.bottom;



    /// TO SET !!!!!!////////////////////////////////////
// set data iterators
const countryPca = d => d.key
const xValuePca = d => d.value.gdp_for_year;
const yValuePca = d => d.value.gdp_per_capita;
const colorValuePca = d => d.value.suicides_pop;
/////////////////////////////////////////////////////////

// set scales ranges
const xScalePca = d3.scaleLinear() 
    .range([ 0, width_pca ])
    .nice();

const yScalePca = d3.scaleLinear()
    .range([ height_pca, 0])
    .nice();


// vars for brush
let pca_toggle_brush = false;
const pcaBrush = d3.brush()                 
    .extent( [ [0,0], [width_pca,height_pca] ] )


// append the svg object to the body of the page
const svgPca = d3.select("#pca")
    .append("svg")
      .attr("width", initial_width_pca)
      .attr("height", initial_height_pca)
    .append("g")
      .attr("transform", "translate(" + margin_pca.left + "," + margin_pca.top + ")");  //padding


// add label left
const pca_left_label_x = ((margin_pca.left/5) * 3) +3;
const pca_left_label_y = (height_pca/2);
svgPca.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-pca_left_label_x}, ${pca_left_label_y}), rotate(-90)`) 
    .text(pca_yLabel)


// add label bottom
const pca_bottom_label_x = width_pca/2;
const pca_bottom_label_y = height_pca + ((margin_pca.bottom/6)*5);
svgPca.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${pca_bottom_label_x},${pca_bottom_label_y})`) //to put on bottom
    .text(pca_xLabel)

// add X axis
const pcaXAxisSvg = svgPca.append("g")
    .attr("transform", "translate(0," + height_pca + ")") //to put on bottom

// add Y axis
const pcaYAxisSvg = svgPca.append("g")

// add Grids
const pcaXGridSvg = svgPca.append('g').attr('class', 'grid-Pca') 
const pcaYGridSvg = svgPca.append('g').attr('class', 'grid-Pca') 


// Add a clipPath: everything out of this area won't be drawn.
const pcaClip = svgPca.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width_pca )
    .attr("height", height_pca )
    .attr("x", 0)
    .attr("y", 0);


// Create the Pca variable: where both the circles and the brush take place
const pcaArea = svgPca.append('g')
    .attr("clip-path", "url(#clip)")


const tooltipPca = d3.select("#pca")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")