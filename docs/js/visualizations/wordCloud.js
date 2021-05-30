

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
    var wordColor = d3.scaleOrdinal().domain(data).range(d3.schemeCategory10);
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
                .style("fill", wordColor(text))
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .text(text);
        });

        cloud1.start();
        // invalidation.then(() => cloud1.stop()); // -------------- INVALIDATION NOT DEFINED --------------------
        return svg.node();
}
