/*
get data from variable: data
compute metric
*/

function compute_metric () {
    for (let i = 0; i < data.length; i++) {
        metric[i] = 0;
        let myMax = -Infinity;
        let mySum = 0;
        let M = concepts.length;
        for (let j = 0; j < M; j++) {
            if (myMax < data[i][concepts[j]]) myMax = data[i][concepts[j]];
            mySum += data[i][concepts[j]];
        }
        if (mySum !== 0) metric[i] = (M/(M-1))*(myMax/mySum-1/M);
        data[i].metric = metric[i];
    }
}
