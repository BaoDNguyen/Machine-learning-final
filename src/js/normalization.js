/*
INPUT: file direction
OUTPUT: raw data and normalized data
note: min-max normalization
*/

function normalization (method) {
    // read normalized data
    dataArr = [];
    data = rawData.map((d,j)=>{
        dataArr[j]=[];
        // return {...d}
        return {id: d.id};
    });
    if (method === 'concept') {
        for (let i = 0; i < concepts.length; i++) {
            let myMax = -Infinity, myMin = Infinity;
            for (let j = 0; j < rawData.length; j++) {
                if (rawData[j][concepts[i]] > myMax) myMax = rawData[j][concepts[i]];
                if (rawData[j][concepts[i]] < myMin) myMin = rawData[j][concepts[i]];
            }
            for (let j = 0; j < rawData.length; j++) {
                data[j][concepts[i]] = (rawData[j][concepts[i]]-myMin)/(myMax-myMin);
                dataArr[j].push(data[j][concepts[i]]);
            }
        }
    } else if (method === 'image') {
        for (let i = 0; i < rawData.length; i++) {
            let myMax = -Infinity, myMin = Infinity;
            for (let j = 0; j < concepts.length; j++) {
                if (rawData[i][concepts[j]] > myMax) myMax = rawData[i][concepts[j]];
                if (rawData[i][concepts[j]] < myMin) myMin = rawData[i][concepts[j]];
            }
            for (let j = 0; j < concepts.length; j++) {
                data[i][concepts[j]] = (rawData[i][concepts[j]]-myMin)/(myMax-myMin);
                dataArr[i].push(data[i][concepts[j]]);
            }
        }
    } else if (method === 'both') {
        let myMax = -Infinity, myMin = Infinity;
        for (let i = 0; i < rawData.length; i++) {
            for (let j = 0; j < concepts.length; j++) {
                if (rawData[i][concepts[j]] > myMax) myMax = rawData[i][concepts[j]];
                if (rawData[i][concepts[j]] < myMin) myMin = rawData[i][concepts[j]];
            }
        }
        for (let i = 0; i < rawData.length; i++) {
            for (let j = 0; j < concepts.length; j++) {
                data[i][concepts[j]] = (rawData[i][concepts[j]]-myMin)/(myMax-myMin);
                dataArr[i].push(data[i][concepts[j]]);
            }
        }
    } else if (method === 'no') {
        for (let i = 0; i < rawData.length; i++) {
            for (let j = 0; j < concepts.length; j++) {
                data[i][concepts[j]] = rawData[i][concepts[j]];
                dataArr[i].push(data[i][concepts[j]]);
            }
        }
    }
}
