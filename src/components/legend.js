// legend static params
const initial_width_legend = document.getElementById('map-legend').offsetWidth;
const initial_height_legend = document.getElementById('map-legend').offsetHeight;
const colorLabel = 'Suicides/100k pop';
const classesInterval = 10;

// set the dimensions and margins of the graph
const margin_legend = {top: 40, right: 10, bottom: 10, left: 8},
    width_legend = initial_width_legend - margin_legend.left - margin_legend.right,
    height_legend = initial_height_legend - margin_legend.top - margin_legend.bottom;


const svgLegend = d3.select("#map-legend")
    .attr('background', 'white')
    .append("svg")
        .attr("width", initial_width_legend)
        .attr("height", initial_height_legend)
    .append("g")
        .attr("transform", "translate(" + margin_legend.left + "," + margin_legend.top + ")")

const tooltipLegend = d3.select("#map-legend")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")



const makeLegend = () => {
    const keys = controller.colorKeys
    const colorScale = controller.colorScale;

    const overLegend = function (d)  {
        d3.select(this)
            .style("cursor", "pointer")

        // get all countries with suicide/100k pop inside the interval
        const start = +this.attributes.class.value
        const end = +this.attributes.class.value + classesInterval 
        const countries = aggregateDataByCountry(controller.dataMapScatter)
                            .filter(((d) => d.value.suicides_pop > start && d.value.suicides_pop < end))

        // make a string iterating on filtered countries
        let string = ''
        if (countries.length == 0) {
            string = 'None'
        } else {
            let count = 0
            countries.forEach((element, i) => {
                if (i == 0) string += `${element.key}` // to avoid , at the end

                if (count < 10) {
                    string += `, ${element.key}`
                    count = 0
                } else 
                    string += `</br>`
                
                count += 1
            });
        }
        
        // show tooltip
        tooltipLegend
            .style("opacity", 1)
            .html(string)
            .style("left", (d3.mouse(this)[0] + 40) + widthMap + "px")   
            .style("top", (d3.mouse(this)[1]) + 90 + "px") //heightMap + "px")

    }    

    const leaveLegend =  (d) => {	
        tooltipLegend
            .style("opacity", 0)
    }

    const labelSet = (d) => {
        if (d<81)
            return `${d} to ${(d+classesInterval)}`
        else
            return `80+`
    }

    svgLegend.append('text')
        .attr('class', 'axis-label')
        .attr("transform", `translate(${margin_legend.left}, 0)`) 
        .text(colorLabel)

    // Add one dot in the legend for each name.
    svgLegend.append('g')
        .attr("transform", `translate(${margin_legend.left+3}, ${margin_legend.right+5})`) 
        .selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr('class', (d) => d)
        .attr("cx", 10)
        .attr("cy", (d,i) =>  10 + i*26) 
        .attr("r", scatter_circle_size+2)
        .style("fill", (d) => colorScale(d))
        .on("mouseover", overLegend)
        .on("mouseout", leaveLegend)

    // Add one dot in the legend for each name.
    svgLegend.append('g')
        .attr("transform", `translate(${margin_legend.left+3}, ${margin_legend.right+5})`) 
        .selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .attr("x", 30)
        .attr("y", (d,i) => 15 + i*26) 
        .style("fill", 'white')
        .text(labelSet)

}


const updateLegend = () => {
    svgLegend.selectAll('.text').remove()
    svgLegend.selectAll('.circle').remove()
    makeAgeChart()
}