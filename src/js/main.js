viz = vizControl();
function main (fileName) {
    d3.csv(fileName).then(file => {
        readFile(file);
        normalization();
        compute_metric();

        // UI init
        initMenu();
        viz.init()
            .feature(concepts)
            .data({data,dataArr})
            .draw();
        updateProcess()
    });
}

main('./data/concept_score.csv');