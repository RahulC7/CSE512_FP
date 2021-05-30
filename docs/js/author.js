/* NOTE:
Data connection code is in ./dataloader/dataloader.js
Also, all the visualizations are loaded from the ./visualizations/ folder
*/


// -------------- DOCUMENT READY --------------

function load_visualizations() {
    $(document).ready(function() {
        $('#author_name').html(author.name); // set author name
        createWordCloud(600, 400, ".wordcloud-graph");
                
        createArcDiagram(".network-graph")

        // bar chart
        let chart2 = createBarChart(2000, 0, ".collaborators-graph", createBarChartData, true);
        updateBarChart = () => { chart2.update(); };
        updateBarChart();

        let chart3 = createBarChart(2000, 0, ".mostcited-graph", createCollaboratorData, false);
        updateBarChart2 = () => { chart3.update(); };
        updateBarChart2();

        let chart4 = createtimeSeries(2000, 500, ".timeseries-graph");
        updateBarChart3 = () => { chart4.update(); };
        updateBarChart3();
    });    
}
