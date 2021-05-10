viz = vizControl();
function main (normalizationMethod) {
    d3.csv("./data/concept_score.csv").then(file => {
        readFile(file);
        normalization(normalizationMethod);
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

main('concept');