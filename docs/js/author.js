// define default parameters
let searchParams = new URLSearchParams(window.location.search);
let authorId = '53f59584dabfaee473f8045b';
const a2pFilename = '../docs/data/dblp2010_a2p_jheer.json';
const p2aFilename = '../docs/data/dblp2010_p2a_jheer.json';
let author_to_paper, paper_to_author, author_name = 'Jeffrey Heer';


if(searchParams.has('id')) {
    authorId = searchParams.get('id');
}





function createSource(){
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
    let result = [];  
    keywords.forEach((val, key)=> {result.push({text: key, value: val});});
    return result;
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
    
    let data = createSource();
    
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
        invalidation.then(() => cloud1.stop()); // -------------- INVALIDATION NOT DEFINED --------------------
        return svg.node();
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
            
        });
    });
});


