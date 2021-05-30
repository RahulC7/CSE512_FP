
// define default parameters
let searchParams = new URLSearchParams(window.location.search);
let authorId = '53f42be9dabfaec22ba01006', author = {name: "Hideki Kozima"};
const a2pFilename = './data/dblp_robotics_a2p.json'; // './data/dblp2010_a2p_jheer.json';
const p2aFilename = './data/dblp_robotics_p2a.json'; // './data/dblp2010_p2a_jheer.json';
let a2pDt, p2aDt;
let author_to_paper, paper_to_author;


if(searchParams.has('id')) {
    authorId = searchParams.get('id');
}


$.getJSON(a2pFilename, function(a2p) { // load authors_to_papers
    // get provided authors details
    a2pDt = aq.from(a2p); // arquero seems to be too limited, no for loops, and sets can't be passed
}).then(() => {
    $.getJSON(p2aFilename, function(p2a) {
        p2aDt = aq.from(p2a);
    }).then(() => {
        filter_data();
        load_visualizations();
    });
});

// take full a2p & p2a and convert them to subsets
// the subsets contain: 
// author_to_paper = this author + all their collaborators
// paper_to_author = each paper of this author + each paper of this author's collaborators
function filter_data() {
    author = a2pDt.params({id: authorId}).filter((d, $) => (d._id == $.id)).objects()[0];
    let collaborators = new Set();
    let author_papers = new Set(author.papers);
    // for every paper that this person has authored, get a set of their coauthors
    p2aDt.objects().filter((d) => author_papers.has(d._id)).forEach(d => {
            for(let cur_author of d.authors) {
                collaborators.add(cur_author._id);
            }
        });
    // now that we have collaborators, generate author_to_paper and paper_to_author
    author_to_paper = a2pDt.objects().filter(d => collaborators.has(d._id));
    paper_to_author = p2aDt.objects().filter(d => {
        for(let cur_author of d.authors) {
            if(collaborators.has(cur_author._id)) {
                return true;
            }
        }
        return false;
    });
}

