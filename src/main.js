d3.csv('./data/concept_score.csv').then(file => {
    readFile(file);
    normalization();
    compute_metric();
});