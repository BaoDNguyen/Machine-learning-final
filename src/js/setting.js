/*
GLOBAL VARIABLES FOR STORING DATA
*/

let rawData = [];
let data = [];
let dataArr = [];
let concepts = ['airplane','bed','bench','boat','book','horse','person'];

/*
METRIC SCORES
*/

let metric = [];

// graphic

let viz = {};
// violin
let violiin_chart = d3.viiolinChart().graphicopt({width:200 ,height:25,opt:{dataformated:true},stroke:'purple',isStack:false,midleTick:true,showOutlier:false,direction:'h',margin: {top: 0, right: 10, bottom: 0, left: 10},middleAxis:{'stroke-width':0.5},ticks:{'stroke-width':0.5}})
    .setTicksDisplay([0,1]);
