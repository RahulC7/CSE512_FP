function createArcSeriesData() {
    let prevdata = createCollaboratorData();
    let data = [];
    prevdata.forEach((val,key)=>{data.push(key);});
    get_node_links_from = (author_names) => {
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
            return ['M', start, height-38,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                    'A',                            // This means we're gonna build an elliptical arc
                    (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                    (start - end)/2, 0, 0, ',',
                        start < end ? 1 : 0, end, ',', height-38] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
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
