/*
Read raw data to variable: rawData
INPUT: csv file
*/

function readFile (file) {
    // read raw data
    if (rawData.length > 0) rawData.length = 0;
    for (let i = 0; i < file.length; i++) {
        rawData[i] = {
            'id': file[i]['id'],
            'airplane': +file[i]['airplane'],
            'bed': +file[i]['bed'],
            'bench': +file[i]['bench'],
            'boat': +file[i]['boat'],
            'book': +file[i]['book'],
            'horse': +file[i]['horse'],
            'person': +file[i]['person'],
        }
    }
}