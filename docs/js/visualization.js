const a2pFilename = '../data/dblp2010_a2p_jheer.json';
const p2aFilename = '../data/dblp2010_p2a_jheer.json';
var a2pDt, p2aDt, coauthorDt;
var confOptions, authorOptions;
var selectedConfIds = new Set(), selectedAuthorIds = new Set();
var yearFilter, numPubsFilter, numCollabsFilter, citationCountFilter;

let tooltip;
function moveTooltip(evt) {
	tooltip.style("left", evt.pageX + "px");
	tooltip.style("top", evt.pageY + "px");
}

let updateNetwork = () => {};

function onYearChange(min, max) {
    yearFilter = [Math.ceil(min), Math.floor(max)];
    updateNetwork();
}
function onNumPubChange(min, max) {
    numPubsFilter = [min, max];
    updateNetwork();
}
function onNumCollabChange(min, max) {
    numCollabsFilter = [min, max];
    updateNetwork();
}
function onCitationCountChange(min, max) {
    citationCountFilter = [min, max];
    updateNetwork();
}

function createPubYearFilter(parentSelector, w, h) {
    document.querySelector(parentSelector).innerHTML = "";
    yearFilter = [2010, 2021];
    initialData = p2aDt
        .groupby('year')
        .count()
        .orderby('year')
        .select('year', 'count')
        .rename({'year' : 'key', 'count' : 'value'})
        .reify()
        .objects();
    p2aDt.ungroup(); p2aDt.unorder();
    return barRangeSlider(initialData, w, h, parentSelector, onYearChange);
}

function createNumPubsFilter(parentSelector, w, h) {
    document.querySelector(parentSelector).innerHTML = "";
    const initialData = a2pDt.array('papers').map((p) => p.length);
    numPubsFilter = [Math.min(...initialData), Math.max(...initialData)];
    return rangeSlider(...numPubsFilter, w, h, parentSelector, onNumPubChange);
}

function createNumCollabsFilter(parentSelector, w, h) {
    document.querySelector(parentSelector).innerHTML = "";
    numCollabsFilter = [1, 100]; // TODO: use the actual range
    return rangeSlider(...numCollabsFilter, w, h, parentSelector, onNumCollabChange);
}

function createCitationCountFilter(parentSelector, w, h) {
    document.querySelector(parentSelector).innerHTML = "";
    const initialData = p2aDt.array('n_citation');
    citationCountFilter = [Math.min(...initialData), Math.max(...initialData)];
    return rangeSlider(...citationCountFilter, w, h, parentSelector, onCitationCountChange);
}

function get_nodes_links_from(
    selectedAuthorIds,
    selectedConfIds,
    [minYear, maxYear],
    [minNPub, maxNPub],
    [minNCollab, maxNCollab],
    [minNCitation, maxNCitation]) {
    
    // get the papers by selectedConfIds
    let papers = p2aDt
        .params({confIds : selectedConfIds})
        .filter((d, $) => $.confIds.size == 0 || $.confIds.has(d.venue['_id']))
        .objects();

    // filter the papers by selectedAuthorIds
    let paperIds = new Set();
    for (var i = 0; i < papers.length; i++) {
        var hasSelectedAuthors = selectedAuthorIds.size == 0;
        for (let author of papers[i].authors) {
            if (selectedAuthorIds.has(author._id)) {
                hasSelectedAuthors = true;
                break;
            }
        };
        if (hasSelectedAuthors) paperIds.add(papers[i]._id);
    }
    // get the coauthors from papers that pass the yearFilter and NCitationFilter
    let coauthors = p2aDt
        .params({minY : minYear, maxY : maxYear, minNC : minNCitation, maxNC : maxNCitation})
        .filter((d, $) => d.year >= $.minY && d.year <= $.maxY
        && d.n_citation >= $.minNC && d.n_citation <= $.maxNC)
        .select('_id', 'authors')
        .objects();
    let coauthorIds = new Set();
    for (let coauthorArr of coauthors) {
        if (paperIds.has(coauthorArr._id)) {
            for (let coauthor of coauthorArr.authors) {
                coauthorIds.add(coauthor._id);
            }
        }
    }

    // keep only the coauthors that pass the NPubFilter
    coauthors = a2pDt
        .params({minNP : minNPub, maxNP : maxNPub})
        .derive({numPapers : d => d.papers.length})
        .filter((d, $) => d.numPapers >= $.minNP && d.numPapers <= $.maxNP)
        .select('_id', 'numPapers', 'name')
        .rename({'_id' : 'id'})
        .objects();
    let nodes = [];
    for (let coauthor of coauthors) {
        if (coauthorIds.has(coauthor.id)){
            nodes.push(coauthor);
        }
    }
    coauthorIds = new Set();
    for (let coauthor of nodes) {
        coauthorIds.add(coauthor.id);
    }

    // construct the coauthor table.
    let sources = [], targets = [];
    for (let paper of papers) {
        if (!paperIds.has(paper._id)) continue;
        var authors = paper.authors;
        for (var i = 0; i < authors.length - 1; i++) {
            if (!coauthorIds.has(authors[i]._id)) continue;
            for (var j = 1; j < authors.length; j++) {
                if (!coauthorIds.has(authors[j]._id)) continue;
                var src = authors[i]._id;
                var tgt = authors[j]._id;
                if (src > tgt) {
                    src = authors[j]._id;
                    tgt = authors[i]._id;
                }
                sources.push(src);
                targets.push(tgt);
            }
        }
    }
    coauthorDt = aq.table({ source : sources, target : targets });
    // compute the links.
    let links = coauthorDt
        .params({minNC : minNCollab, maxNC : maxNCollab})
        .groupby('source', 'target')
        .count()
        .filter((d, $) => d.count >= $.minNC && d.count <= $.maxNC)
        .select('source', 'target', 'count')
        .rename({'count' : 'numPapers'})
        .reify()
        .objects();
    coauthorDt.ungroup();

    return { nodes, links };
}

function get_neighbors_of(authorId) {
	let neighbors = new Set();
    var tgt_nbrs = coauthorDt
        .params({aId : authorId})
        .filter((d, $) => d.source == $.aId)
        .select('target')
        .objects();
    var src_nbrs = coauthorDt
        .params({aId : authorId})
        .filter((d, $) => d.target == $.aId)
        .select('source')
        .objects();
    for (let tgt of tgt_nbrs) {
        neighbors.add(tgt);
    }
    for (let src of src_nbrs) {
        neighbors.add(src);
    }
    return neighbors;
}

function createNetworkChart(w, h, parentSelector) {
    const width = w;
    const height = h;
    const svg = d3
        .select(parentSelector)
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // Allow zoom/panning
    const g = svg.append("g").attr("class", "everything"); // encompassing group
    d3.zoom()
      .scaleExtent([1 / 8, 4])
      .on("zoom", (evt) => g.attr("transform", evt.transform))(svg);

    tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    let link = g.append("g").attr("class", "lines").selectAll("line");
    let node = g.append("g").attr("class", "nodes").selectAll("circle");

    let simulation = d3
        .forceSimulation()
        .force(
            "link",
            d3.forceLink()
              .id((d) => d.id)
              .distance(10)
        )
        .force("charge", d3.forceManyBody().strength(-80).distanceMax(150))
        .force(
            "collision",
            d3.forceCollide().radius((d) => Math.sqrt(d.numPapers))
        )
        // .force("center", d3.forceCenter(0, 0).strength(0.02))
        .force("x", d3.forceX().strength(0.02))
        .force("y", d3.forceY().strength(0.02))
        .velocityDecay(0.7)
        .alphaDecay(0.03)
        .on("tick", () => {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        });

    function update() {
        let { nodes, links } = get_nodes_links_from(
            selectedAuthorIds,
            selectedConfIds,
            yearFilter,
            numPubsFilter,
            numCollabsFilter,
            citationCountFilter
        );

        node = node
            .data(nodes, (d) => d.id)
            .join(
                (enter) =>
                    enter // animate fading in, growing circle
                        .append("circle")
                        .classed("clicked", (d) => clickedAuthors.has(d.id))
                        .classed("clickedactive", (d) => clickedAuthors.getActive() === d.id)
                        .attr("x", (Math.random() - 0.5) * width)
                        .attr("y", (Math.random() - 0.5) * height)
                        .attr("r", 1)
                        .style("opacity", 0.5)
                        .transition()
                        .duration(800)
                        .attr("r", (d) => Math.sqrt(d.numPapers))
                        .style("opacity", 1)
                        .selection(),
                (update_) =>
                    update_
                        .attr("x", (Math.random() - 0.5) * width)
                        .attr("y", (Math.random() - 0.5) * height)
                        .classed("clicked", (d) => clickedAuthors.has(d.id))
                        .classed("clickedactive", (d) => clickedAuthors.getActive() === d.id)
                        .attr("r", (d) => Math.sqrt(d.numPapers)),
                (exit) =>
                    exit // animate fading out, shrinking circle
                        .classed("exit", true)
                        .classed("neighbor", false)
                        .transition()
                        .duration(900)
                        .style("opacity", 0)
                        .attr("r", 0)
                        .remove()
            );

        // When an author node is clicked, toggle showing its neighbors and update
        function click(evt, d) {
            if (evt.defaultPrevented) return;
            if (clickedAuthors.size() > 1 && clickedAuthors.has(d.id)) {
                clickedAuthors.delete(d.id);
            } else {
                clickedAuthors.add(d);
                tooltip.classed("clickedactive", true).classed("clicked", true)
            }
            update();
        }

        // When an author node is hovered over, highlight neighbors and edges
        function hoverOn(_evt, d) {
            link.classed(
                "highlight",
                (e) => e.source.id === d.id || e.target.id === d.id
            );
            const neighbors = get_neighbors_of(d.id);
            node.classed("neighbor", (e) => neighbors.has(e.id));

            const plural = d.numPapers > 1 ? "papers" : "paper";
            tooltip
                .classed("clickedactive", clickedAuthors.getActive() === d.id)
                .classed("clicked", clickedAuthors.has(d.id))
                .html(`<span>${d.name}</span><span>${d.numPapers} ${plural}</span>`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        }
        // Author node is unhovered, unhighlight all edges and nodes
        function hoverOut(_evt, _d) {
            link.classed("highlight", false);
            node.classed("neighbor", false);
            tooltip.transition().duration(500).style("opacity", 0);
        }

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.2).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
        
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
                moveTooltip(event.sourceEvent);
            }
        
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
        
            return d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }            

        node
            .on("click", click)
            .on("mouseover", hoverOn)
            .on("mouseout", hoverOut)
            .on("mousemove", moveTooltip)
            .call(drag(simulation));

        link = link.data(links).join(
            (enter) =>
                enter
                    .append("line")
                    .style("stroke-opacity", 0)
                    .transition()
                    .duration(800)
                    .style("stroke-opacity", (d) => Math.min(1, d.numPapers / 10))
                    .selection(),
            (update_) => update_,
            (exit) =>
                exit
                    .classed("exit", true)
                    .classed("highlight", false)
                    .transition()
                    .duration(800)
                    .style("stroke", "#fff")
                    .style("opacity", 0)
                    .remove()
        );

        // Add titles
        link
            .append("title")
            .text((d) => `${d.source} - ${d.target} (${d.numPapers})`);

        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();
    }

    return Object.assign(svg.node(), { update });
}

$(document).ready(function() {
    $.getJSON(a2pFilename, function(a2p) {
        a2pDt = aq.from(a2p);
        authorOptions = a2pDt
            .select("_id", "name")
            .rename({"_id" : "id", "name" : "text"})
            .objects();
        $('.author-select').select2({
            placeholder: "Author Name",
            allowClear: true,
            data: authorOptions
        });
    }).then(() => {
        $.getJSON(p2aFilename, function(p2a) {
            p2aDt = aq.from(p2a);
            var venues = p2aDt.array('venue');
            var venue_ids = new Set();
            var unique_venues = [];
            for (var i = 0; i < venues.length; i++) {
                if (!venue_ids.has(venues[i]._id)) {
                    venue_ids.add(venues[i]._id);
                    unique_venues.push(venues[i]);
                }
            }
            confOptions = $.map(unique_venues, function (venue) {
                venue.id = venue._id;
                venue.text = venue.name;
                return venue;
            });
            $('.conf-select').select2({
                placeholder: "Venue Name",
                allowClear: true,
                data: confOptions
            });
        }).then(() => {
            createNumPubsFilter(".numPubFilter", 250, 10);
            createNumCollabsFilter(".numCollabFilter", 250, 10);
            createCitationCountFilter(".citationCountFilter", 250, 10);
            createPubYearFilter(".pubYearFilter", 400, 200);

            let networkChart = createNetworkChart(600, 400, ".network-graph");
            updateNetwork = () => { networkChart.update(); }
            updateNetwork();

            $('.conf-select').on('change', function (e) {
                selectedConfIds = new Set(e.params.data.map(d => d.id));
                updateNetwork();
            });
            $('.author-select').on('change', function (e) {
                selectedAuthorIds = new Set(e.params.data.map(d => d.id));
                updateNetwork();
            });
        });
    });
});
