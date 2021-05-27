// define default parameters
let searchParams = new URLSearchParams(window.location.search);
let authorId = '53f59584dabfaee473f8045b';
const a2pFilename = '../docs/data/dblp2010_a2p_jheer.json';
const p2aFilename = '../docs/data/dblp2010_p2a_jheer.json';
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
    // data.sort((a, b) => (a.value < b.value) ? 1 : -1);

    let data = [{name: "Dhruv Yadav", value: 42}, {name: "Rahul Chandra", value: 30}];
    
    return data;
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
			.attr("fill", "steelblue")
			.selectAll("rect")
			.data(data)
			.join("rect")
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
            
            // bar chart
            let chart2 = createBarChart(2000, 0, ".collaborators-graph");
            updateBarChart = () => { chart2.update(); };
            updateBarChart();
        });
    });
});


