/*
INPUT: file direction
OUTPUT: raw data and normalized data
note: min-max normalization
*/

function normalization () {
    // read normalized data
    if (data.length > 0) data.length = 0;
    for (let j = 0; j < rawData.length; j++) {
        data[j] = {};
    }
    for (let i = 0; i < concepts.length; i++) {
        let myMax = -Infinity, myMin = Infinity;
        for (let j = 0; j < rawData.length; j++) {
            if (rawData[j][concepts[i]] > myMax) myMax = rawData[j][concepts[i]];
            if (rawData[j][concepts[i]] < myMin) myMin = rawData[j][concepts[i]];
        }
        for (let j = 0; j < rawData.length; j++) {
            data[j][concepts[i]] = (rawData[j][concepts[i]]-myMin)/(myMax-myMin);
        }
    }
}