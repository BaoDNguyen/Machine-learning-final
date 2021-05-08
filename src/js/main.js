
viz = vizControl();
d3.csv('./data/concept_score.csv').then(file => {
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
