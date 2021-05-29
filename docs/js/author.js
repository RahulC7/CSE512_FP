// define default parameters
let searchParams = new URLSearchParams(window.location.search);
let authorId = '53f59584dabfaee473f8045b';
const a2pFilename = './data/dblp2010_a2p_jheer.json';
const p2aFilename = './data/dblp2010_p2a_jheer.json';
let author_to_paper, paper_to_author, author_name = 'Jeffrey Heer';


if(searchParams.has('id')) {
    authorId = searchParams.get('id');
}




function createWorldCloudData(){
    let keywords = new Map();
    for(let paper of paper_to_author){
        let cur_keywords = paper.keywords;
        for(let i = 0; i<cur_keywords.length; i++){
            let keyword = cur_keywords[i];
            if(keywords.has(keyword)){
                keywords.set(keyword, keywords.get(keyword)+1);
            }
            else{
                keywords.set(keyword,1);
            }
        }
    }
    let data = [];  
    keywords.forEach((val, key)=> {data.push({text: key, value: val});});
    return data;
}

function createWordCloud(width, height, source){    
    rotate = () => 0;
    padding = 0;
    fontScale = 15;
    fontFamily = "Lato";
    
    const svg = d3.select(source).append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle");
    
    let data = createWorldCloudData();
    
    const cloud1 = d3.layout.cloud()
        .size([width, height])
        .words(data.map(d => Object.create(d)))
        .padding(padding)
        .rotate(rotate)
        .font(fontFamily)
        .fontSize(d => Math.sqrt(d.value) * fontScale)
        .on("word", ({size, x, y, rotate, text}) => {
            svg.append("text")
                .attr("font-size", size)
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .text(text);
        });
      
        cloud1.start();
        // invalidation.then(() => cloud1.stop()); // -------------- INVALIDATION NOT DEFINED --------------------
        return svg.node();
}



let updateBarChart = () => { };

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

function createArcSeriesData(){
    let prevdata = createCollaboratorData();
    let data = [];
    prevdata.forEach((val,key)=>{data.push(key);});
    get_node_links_from = (
  author_names
) => {
  let [papers, authors] = get_papers_from(
    author_names,
    [minYear, maxYear],
    [minCitations, maxCitations]
  );

  let nodes = [];
  for (let [key, val] of authors) {
    nodes.push({
      id: key,
      // numPapers: val
      numPapers: author_to_papers[key].length
    });
  }
  let links = [];

  for (let i = 0; i < nodes.length; i++) { // iterate over all authors
    let papers_i = author_to_papers[nodes[i].id]; // list of papers for ith author
    for (let j = i + 1; j < nodes.length; j++) { // iterate over the rest of authors
      let papers_j = author_to_papers[nodes[j].id]; // again, paper list
      let num_intersect = papers_i.filter(
        (v) =>
          paper_to_authors[v].year >= minYear &&
          paper_to_authors[v].year <= maxYear &&
          paper_to_authors[v].numCitations >= minCitations &&
          paper_to_authors[v].numCitations <= maxCitations &&
          papers_j.includes(v)
      ).length;

      if (num_intersect) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          numPapers: num_intersect
        });
      }
    }
  }

  return { nodes, links };
}
    
}

function createBarChart2(width, height, source) {
    let fontFamily = "Lato";
    let fontSize = 60;
    let barHeight = 75;

	const svg = d3.select(source)
		.append("svg")
		.attr("viewBox", [0, 0, width, height]);
    
	function update() { // TODO: add range slider support
		let data = createCollaboratorData();
        
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













function createBarChart(width, height, source) {
    let fontFamily = "Lato";
    let fontSize = 60;
    let barHeight = 75;

	const svg = d3.select(source)
		.append("svg")
		.attr("viewBox", [0, 0, width, height]);
    
	function update() { // TODO: add range slider support
		let data = createBarChartData();
        
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
            .attr("xlink:href", d => d.url)
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



function createtimeSeries(width, height, source) {
    let fontFamily = "Lato";
    let fontSize = 60;
    let barHeight = 75;

	const svg = d3.select(source)
		.append("svg")
		.attr("viewBox", [0, 0, width, height]);
    
	function update() { // TODO: add range slider support
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
        curve = d3.curveLinear
        area = d3.area()
        .curve(curve)
        .x(d => x(d.date))
        .y0(y(0))
        .y1(d => y(d.value))

        


        svg.append("path")
            .datum(data)
            .attr("fill", "steelblue")
            .attr("d", area);

        svg.append("g")
            .call(xAxis).style("font-size","20px");

        svg.append("g")
            .call(yAxis).style("font-size","20px");

	}

	console.log(svg);
	return Object.assign(svg.node(), { update });
}



function createArcDiagram(source) {
    let fontFamily = "Lato";
    let fontSize = 60;
    let barHeight = 75;


    // set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 20, left: 30},
  width = 500 - margin.left - margin.right,
  height = 360 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select(source)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
  .attr("transform",`translate(${margin.left},${margin.top})`);

// Read dummy data
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json").then(function(data) {
  // List of node names
  console.log(data)
  const allNodes = data.nodes.map(d=>d.name)
  
  // A linear scale to position the nodes on the X axis
  const x = d3.scalePoint()
    .range([0, width])
    .domain(allNodes)

  // Add the circle for the nodes
  const nodes = svg
    .selectAll("mynodes")
    .data(data.nodes)
    .join("circle")
    .attr("cx", d => x(d.name))
    .attr("cy", height-30)
    .attr("r", 8)
    .style("fill", "steelblue")

  // And give them a label
  const labels = svg
    .selectAll("mylabels")
    .data(data.nodes)
    .join("text")
    .attr("x", d=>x(d.name))
    .attr("y", height-10)
    .text(d=>(d.name))
    .style("text-anchor", "middle")

  // Add links between nodes. Here is the tricky part.
  // In my input data, links are provided between nodes -id-, NOT between node names.
  // So I have to do a link between this id and the name
  const idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });
  // Cool, now if I do idToNode["2"].name I've got the name of the node with id 2

  // Add the links
  const links = svg
    .selectAll('mylinks')
    .data(data.links)
    .join('path')
    .attr('d', d=> {
      start = x(idToNode[d.source].name)    // X position of start node on the X axis
      end = x(idToNode[d.target].name)      // X position of end node
      return ['M', start, height-30,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
              'A',                            // This means we're gonna build an elliptical arc
              (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
              (start - end)/2, 0, 0, ',',
                start < end ? 1 : 0, end, ',', height-30] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                .join(' ');
      })
      .style("fill", "none")
      .attr("stroke", "black")

    // Add the highlighting functionality
    nodes
      .on('mouseover', function(event,d){
        // Highlight the nodes: every node is green except of him
        nodes.style('fill', "steelblue")
        d3.select(this).style('fill', 'steelblue')
        // Highlight the connections
        links
          .style('stroke', a=>  a.source === d.id || a.target === d.id ? 'steelblue' : 'steelblue')
          .style('stroke-width', a=>a.source === d.id || a.target === d.id ? 4 : 1)
      })
      .on('mouseout', function(event,d){
        nodes.style('fill', "steelblue")
        links
          .style('stroke', 'black')
          .style('stroke-width', '1')
      })
})
}











// -------------- DOCUMENT READY --------------

$(document).ready(function() {
    $('#author_name').html(author_name); // set author name
    $.getJSON(a2pFilename, function(a2p) { // load authors_to_papers
        a2pDt = aq.from(a2p);
        author_to_paper = a2p;
        authorOptions = a2pDt
            .select("_id", "name")
            .rename({"_id" : "id", "name" : "text"})
            .objects();
    }).then(() => {
        $.getJSON(p2aFilename, function(p2a) { // load papers_to_authors
            p2aDt = aq.from(p2a);
            paper_to_author = p2a;
        }).then(() => { // load visualizations
            createWordCloud(600, 400, ".wordcloud-graph");
            
            createArcDiagram(".network-graph")

            // bar chart
            let chart2 = createBarChart(2000, 0, ".collaborators-graph");
            updateBarChart = () => { chart2.update(); };
            updateBarChart();

            let chart3 = createBarChart2(2000, 0, ".mostcited-graph");
            updateBarChart2 = () => { chart3.update(); };
            updateBarChart2();

            let chart4 = createtimeSeries(2000, 500, ".timeseries-graph");
            updateBarChart3 = () => { chart4.update(); };
            updateBarChart3();
        });
    });
});


