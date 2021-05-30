

function createTimeSeriesData() {
    let years = new Map();
    for(let paper of paper_to_author){
        let y = paper.year;
        if(years.has(y)){
            years.set(y,years.get(y)+1);
        }
        else{
            years.set(y,1);
        }
    }
    let data = [];
    years.forEach((val, key)=> {data.push({date: key, value: val});});
    data.sort((a, b) => (a.date < b.date) ? -1 : 1);
    return  data;
}




function createtimeSeries(width, height, source) {
    let fontFamily = "Lato";
    let fontSize = 60;
    let barHeight = 75;

	const svg = d3.select(source)
		.append("svg")
		.attr("viewBox", [0, 0, width, height]);

	function update() { // TODO: add range slider support
        var timeColor = d3.scaleSequential().domain([1,10]).interpolator(d3.interpolateViridis);
		let data = createTimeSeriesData();
        console.log(data)
        margin = ({top: 20, right: 20, bottom: 35, left: 35})
       let x = d3.scaleLinear()
		.domain([d3.min(data,d=>d.date), d3.max(data, d => d.date)])
		.range([margin.left, width - margin.right]);
        y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top])
        xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 400).tickSizeOuter(0))

        yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))
        curve = d3.curveCatmullRom

        area = d3.area()
        .curve(curve)
        .x(d => x(d.date))
        .y0(y(0))
        .y1(d => y(d.value));
        // for animation purpose
        var beforeArea = d3.area()
        .curve(curve)
        .x(d => x(d.date))
        .y0(y(0))
        .y1(0);

        var defs = svg.append("defs");

        var gradient = defs.append("linearGradient")
        .attr("id", "svgGradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

        gradient.append("stop")
        .attr("class", "start")
        .attr("offset", "40%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 0.6);


        gradient.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", "blue")
        .attr("stop-opacity", 0.6);


        svg.append("path")
            .datum(data)
            .style("fill","url(#svgGradient)")
            .attr("d", beforeArea)
            .transition()
            .duration(2000)
            .attr("d", area);

        svg.append("g")
            .call(xAxis).style("font-size","20px");

        svg.append("g")
            .call(yAxis).style("font-size","20px");

	}

	console.log(svg);
	return Object.assign(svg.node(), { update });
}