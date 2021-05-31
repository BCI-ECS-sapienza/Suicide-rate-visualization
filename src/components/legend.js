const makeLegend = () => {

    ////////////////////////// CALLBACK //////////////////////////

    const overLegend = function (d)  {
        d3.select(this)
            .style("cursor", "pointer")

        // get all countries with suicide/100k pop inside the interval
        const start = +this.attributes.class.value
        const end = +this.attributes.class.value + classesInterval 
        const countries = dataFiltered.filter(((d) => d.value.suicides_pop > start && d.value.suicides_pop < end))

        // make a string iterating on filtered countries
        let string = ''
        let count = 0
        countries.forEach((element, i) => {
            if (count < 10) {
                string += `${element.key}, `
                count = 0
            } else 
                string += `</br>`
            
            count += 1
        });
        string += `<b>#Countries:</b> ${countries.length}`
        
        // show tooltip
        tooltipLegend
            .style("opacity", 1)
            .html(string)
            .style("left", (d3.mouse(this)[0] + 40) + widthMap + "px")   
            .style("top", (d3.mouse(this)[1]) + 90 + "px") //heightMap + "px")

    }    

    const leaveLegend = function (d) {	
        tooltipLegend
            .style("opacity", 0)
    }

    const labelSet = (d) => {
        if (d<81)
            return `${d} to ${(d+classesInterval)}`
        else
            return `80+`
    }

    const getMeanSize = function (d) {
        if (avg > d && avg < d+classesInterval) return scatter_circle_size*2
        else return scatter_circle_size + 1
    }

    const getMeanStroke = function (d) {
        if (avg > d && avg < d+classesInterval) return 'green'
        else return null
    }

    const getMeanWidth = function (d) {
        if (avg > d && avg < d+classesInterval) return 2
    }



    ////////////////////////// SETUP //////////////////////////

    // get data
    const keys = controller.colorKeys
    const colorScale = controller.colorScale;
    const dataFiltered = aggregateDataByCountry(controller.dataMapScatter);

    // compute avg colorscale
    const avg = Math.round((d3.sum(dataFiltered, (d) => colorValueScatter(d))) / dataFiltered.length *10) /10;



    ////////////////////////// CALL COMPONENTS //////////////////////////

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
        .attr("r", getMeanSize)
        .style("fill", (d) => colorScale(d))
        .style("stroke", getMeanStroke)
        .style("stroke-width", getMeanWidth)
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
    svgLegend.selectAll('text').remove()
    svgLegend.selectAll('circle').remove()
    makeLegend()
}