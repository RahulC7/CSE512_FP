
// -------------------- DATA GENERATION PART --------------------

function createBarChartData() {
    let data = []
    for(let paper of paper_to_author){
        data.push({name: paper.title.slice(0,10), value: paper.n_citation, url: paper.url})
    }
    // for (let paperId of author_to_papers[last_clicked]) {
    //     const p = paper_to_authors[paperId];
    //     if (true
    //         // p.year >= minYear &&
    //         // p.year <= maxYear &&
    //         // p.numCitations >= minCitations &&
    //         // p.numCitations <= maxCitations
    //     ) {
    //         data.push({ name: p.title, value: p.numCitations });
    //     }
    // }
    data.sort((a, b) => (a.value < b.value) ? 1 : -1);

    //let data = [{name: "Dhruv Yadav", value: 42, url: 'http://aops.com'}, {name: "Rahul Chandra", value: 30, url: 'http://google.com'}];
    
    return data.slice(0,Math.min(data.length,10));
}

function createCollaboratorData() {
    let authors = new Map();
   
    for(let paper of paper_to_author){
        let cur_authors = paper.authors;
       
        let cur_citations = paper.n_citation;
        for(let i = 0; i<cur_authors.length;i++){
            let author = cur_authors[i]
            
            let name = author.name;
            if(authors.has(name)){
                authors.set(name,authors.get(name)+cur_citations);
            }
            else{
                authors.set(name,cur_citations);
            }
        }
    }
    let data = [];  
    authors.forEach((val, key)=> {data.push({name: key, value: val});});
    data.sort((a, b) => (a.value < b.value) ? 1 : -1);
    return  data.slice(1,Math.min(data.length,11));
}



// -------------------- VISUALIZATION PART --------------------

let updateBarChart = () => { };

function createBarChart(width, height, source, data_generator) {
    let fontFamily = "Lato";
    let fontSize = 60;
    let barHeight = 75;

	const svg = d3.select(source)
		.append("svg")
		.attr("viewBox", [0, 0, width, height]);
    
	function update() { // TODO: add range slider support
		let data = data_generator();
        
        console.log(data);

		let margin = ({ top: 80, right: 20, bottom: 10, left: 350 });
		let height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

		svg.attr("viewBox", [0, 0, width, height]);
		svg.selectAll("g").remove();

		let x = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.value)])
			.range([margin.left, width - margin.right]);
		let y = d3.scaleBand()
			.domain(d3.range(data.length))
			.rangeRound([margin.top, height - margin.bottom])
			.padding(0.1);
		let format = x.tickFormat(20, data.format);

		svg.append("g")
            .selectAll("a")
            .data(data)
            .join("a")
            .attr("xlink:href", d => "https://letmegooglethat.com/?q="+d.name)
			.append("rect")
            .attr("fill", "steelblue")
			.attr("x", x(0))
			.attr("y", (d, i) => y(i))
			.attr("width", d => x(d.value) - x(0))
			.attr("height", y.bandwidth());

		svg.append("g")
			.attr("fill", "white")
			.attr("text-anchor", "end")
			.attr("font-family", fontFamily)
			.attr("font-size", fontSize)
			.selectAll("text")
			.data(data)
			.join("text")
			.attr("x", d => x(d.value))
			.attr("y", (d, i) => y(i) + y.bandwidth() / 2)
			.attr("dy", "0.35em")
			.attr("dx", -4)
			.text(d => format(d.value))
			.call(text => text.filter(d => x(d.value) - x(0) < 20) // short bars
				.attr("dx", +4)
				.attr("fill", "black")
				.attr("text-anchor", "start"));

		let xAxis = g => g
			.attr("transform", `translate(0,${margin.top+8})`)
			.call(d3.axisTop(x).ticks(width / 200, data.format).tickSize(25))
			.call(g => g.select(".domain").remove())

		let yAxis = g => g
			.attr("transform", `translate(${margin.left},0)`)
			.call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSize(25).tickSizeOuter(0));

		svg.append("g")
			.call(xAxis)
            .style("font-size","35px");

		svg.append("g")
			.call(yAxis)
            .style("font-size","45px");

	}

	console.log(svg);

	return Object.assign(svg.node(), { update });
}





