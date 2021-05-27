// define default parameters




let searchParams = new URLSearchParams(window.location.search);
let authorId = '53f59584dabfaee473f8045b';
const a2pFilename = '../docs/data/dblp2010_a2p_jheer.json';
const p2aFilename = '../docs/data/dblp2010_p2a_jheer.json';
let author_to_paper;
let paper_to_author;

if(searchParams.has('id')) {
    authorId = searchParams.get('id');
}


function createSource(){
    let keywords = new Map();
    for(let paper of paper_to_author){
        let s = paper.keywords;
        for(let i = 0; i<s.length; i++){
            let a = s[i];
            if(keywords.has(a)){
                keywords.set(a,keywords.get(a)+1);
            }
            else{
                keywords.set(a,1);
            }
        }
    }
    let n = [];  
    keywords.forEach((val, key)=> {n.push({text: key , value: val  });} );
    console.log(n)
    
    //const obj = Object.fromEntries(keywords);
    return n
}


function createWordCloud(width, height, source){
    
    rotate = () => 0;
    padding = 0;
    fontScale = 15;
    fontFamily = "sans-serif";
    
        const svg = d3.select(source).append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("font-family", fontFamily)
            .attr("text-anchor", "middle");
        alert('hellasd');
        let data = createSource();
        //console.log(data); 
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
        invalidation.then(() => cloud1.stop());
        return svg.node();
      
}


$(document).ready(function() {
    $.getJSON(a2pFilename, function(a2p) {
        a2pDt = aq.from(a2p);
        author_to_paper = a2p;
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
            paper_to_author = p2a;
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
            let networkChart = createWordCloud(600, 400, ".wordcloud-graph");
            //updateNetwork = () => { networkChart.update(); }
            //updateNetwork();
        });
    });
});







// -------------- DOCUMENT READY --------------








$(document).ready(function() {
    // do something
    $('#author_name').html(); // set author name
});
