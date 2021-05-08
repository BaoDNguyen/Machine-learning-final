const vizControl = function(){
    let tooltip = d3.tip().attr('class', 'd3-tip').html(function (d){return `<span>${d}</span>`})
    let graphicopt = {
        margin: {top: 20, right: 20, bottom: 50, left: 50},
        width: 1400,
        height: 700,
        scalezoom: 1,
        zoom: d3.zoom(),
        widthView: function () {
            return this.width * this.scalezoom
        },
        heightView: function () {
            return this.height * this.scalezoom
        },
        widthG: function () {
            return this.widthView() - this.margin.left - this.margin.right
        },
        heightG: function () {
            return this.heightView() - this.margin.top - this.margin.bottom
        },
        centerX: function () {
            return this.margin.left + this.widthG() / 2;
        },
        centerY: function () {
            return this.margin.top + this.heightG() / 2;
        },
        animationTime:1000,
        color:{},
        imageSize:20,
        radaropt : {
            mini:true,
            levels:6,
            gradient:true,
            w:40,
            h:40,
            showText:false,
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            isNormalize:false,
            // schema:serviceFullList
        },
    };
    let umapopt={},tsneopt={dim:2};
    let maindiv='#vizHolder';
    let svg,g;
    let master = {};
    let vizMode = 'pca';
    let data = [],dataArr=[],feature=[],axis=[];
    let xscale = d3.scaleLinear().range([0, graphicopt.widthG()]);
    let yscale = d3.scaleLinear().range([0, graphicopt.heightG()]);
    let color = d3.scaleSequential()
        .interpolator(d3.interpolateSpectral).domain([1,0]);
    let colorMode = 'metric'
    let calFunc = cal_PCA;
    master.init = function(){
        graphicopt.width = d3.select(maindiv).node().getBoundingClientRect().width;
        graphicopt.height = d3.select(maindiv).node().getBoundingClientRect().height;
        svg = d3.select(maindiv).select('.mainLayout');
        svg.attr('width',graphicopt.width)
            .attr('height',graphicopt.height);
        g = svg.select("g.content");
        if (g.empty()){
            g = svg
                .append("g")
                .attr('class','Outcontent')
                .attr("transform", "translate(" + (graphicopt.margin.left) + "," + graphicopt.margin.top + ")")
                .append("g")
                .attr('class','content');
            g.append('g').attr('class','drawArea');
            g.append('g').attr('class','axisHolder').append('defs')
                .selectAll('marker').data(['black','blue'])
                .join('marker')
                .attr('id', d=>'arrow'+fixName2Class(d))
                .attr("refX", 6)
                .attr("refY", 6)
                .attr("markerWidth", 30)
                .attr("markerHeight", 30)
                .attr("orient", "auto")
                .selectAll('path').data(d=>[d])
                .join("path")
                .attr("d", "M 0 0 12 6 0 12 3 6")
                .style("fill", d=>d);
            g.append('g').attr('class','front');
            g.call(tooltip);
            let startZoom = d3.zoomIdentity;
            startZoom.x = 0;
            startZoom.y = 0;
            svg.call(graphicopt.zoom.on("zoom", zoomed));
            svg.call(graphicopt.zoom.transform, d3.zoomIdentity);
        }
        xscale = d3.scaleLinear().range([0, graphicopt.widthG()]);
        yscale = d3.scaleLinear().range([0, graphicopt.heightG()]);
        return master
    }
    function zoomed(){
        g.attr("transform", d3.event.transform);
        // subgraph.el.forEach(svg=>svg.select('g.content').attr("transform", d3.event.transform))
    }
    function reset(){
        svg.call(graphicopt.zoom.transform, d3.zoomIdentity);
    }
    function cal_PCA(){
        let dataIn = dataArr;
        let pca = new PCA();
        let matrix = pca.scale(dataIn, true, true);

        let pc = pca.pca(matrix, 2);

        let A = pc[0];  // this is the U matrix from SVD
        let B = pc[1];  // this is the dV matrix from SVD
        let chosenPC = pc[2];   // this is the most value of PCA
        let solution = dataIn.map((d,i)=>d3.range(0,2).map(dim=>A[i][chosenPC[dim]]));

        axis=[];
        feature.map(function (key, i) {
            let brand = d3.range(0,2).map(dim=>B[i][chosenPC[dim]]);
            axis.push({x1:0,y1:0,z1:0,x2:brand[0],y2:brand[1],z2:brand[2]??0,name:key,scale:5})
        });
        render(solution);
        data.forEach((d,i)=>{
            d.x = solution[i][0];
            d.y = solution[i][1];
        })
    }
    function cal_tSNE(){
        updateProcess({percentage:5,text:'init UMAP'});
        let dataIn = dataArr;
        let tsne = new tsnejs.tSNE(tsneopt);
        stopCondition = 1e-4;
        tsne.initDataRaw(dataIn);
        let stop = false;
        let count = 0;
        let cost = tsne.step();
        solution = tsne.getSolution();
        while (!stop) {
            const cost_old = tsne.step();
            let epsilon = (cost - cost_old);
            stop = (epsilon <stopCondition)&&epsilon >0&&count>100;
            cost = cost_old;
            solution =tsne.getSolution();
            count++;
        }
        render(solution);
        data.forEach((d,i)=>{
            d.x = solution[i][0];
            d.y = solution[i][1];
        })
        updateProcess();
    }
    function cal_UMAP(){
        updateProcess({percentage:5,text:'init UMAP'});
        let dataIn = dataArr;

        umap = new UMAP(umapopt);
        console.log('---init data UMAP-----')
        nEpochs = umap.initializeFit(dataIn);
        nEpochs = Math.min(nEpochs,1000);
        for (let i = 0; i < nEpochs; i++) {
            updateProcess({percentage:(i/nEpochs) *100,text:'calculate'})
            umap.step();
        }
        solution = umap.getEmbedding();
        render(solution);
        data.forEach((d,i)=>{
            d.x = solution[i][0];
            d.y = solution[i][1];
        })
        updateProcess();
    }
    function render(sol){
        let xrange = d3.extent(sol, d => d[0]);
        let yrange = d3.extent(sol, d => d[1]);
        const ratio = graphicopt.heightG() / graphicopt.widthG();
        if ((yrange[1] - yrange[0]) / (xrange[1] - xrange[0]) > graphicopt.heightG() / graphicopt.widthG()) {
            yscale.domain(yrange);
            let delta = ((yrange[1] - yrange[0]) / ratio - (xrange[1] - xrange[0])) / 2;
            xscale.domain([xrange[0] - delta, xrange[1] + delta])
        } else {
            xscale.domain(xrange);
            let delta = ((xrange[1] - xrange[0]) * ratio - (yrange[1] - yrange[0])) / 2;
            yscale.domain([yrange[0] - delta, yrange[1] + delta])
        }
    }
    master.draw = function(){
        const items = g.select('.drawArea').selectAll('g.item')
            .data(data)
            .join('g')
            .attr('class','item')
            .attr('transform',d=>`translate(${xscale(d.x)},${yscale(d.y)})`)
            .on('mouseover',function(d){
                d3.select('#detailItem').append('img')
                    .attr('src',d.id)
                    .attr('class','img-fluid');
                g.select('.drawArea').selectAll('g.item').style('opacity',0.1);
                d3.select(this).style('opacity',1);
            })
            .on('mouseleave',function(d){
                d3.select('#detailItem').selectAll('*').remove();
                g.select('.drawArea').selectAll('g.item').style('opacity',null)
            });
        items.selectAll('circle')
            .data(d=>[d])
            .join('circle')
            .attr('r',5)
            .attr('fill',d=>color(d[colorMode]));
        items.selectAll('image')
            .data(d=>[d])
            .join('image')
            .attr('x',-graphicopt.imageSize/2)
            .attr('y',-graphicopt.imageSize/2)
            .attr('width',graphicopt.imageSize)
            .attr('height',graphicopt.imageSize)
            .attr('xlink:href',d=>d.id)

        if (vizMode!=='pca') {
            axis = [];
        }
        // add axis
        g.select('.axisHolder').selectAll('line.axis').data(axis)
            .join('line')
            .attr('class','axis')
            .attr('x1',d=>xscale(d.x1))
            .attr('y1',d=>yscale(d.y1))
            .attr('x2',d=>xscale((d.x2-d.x1)*d.scale+d.x1))
            .attr('y2',d=>yscale((d.y2-d.y1)*d.scale+d.y1))
            .attr('marker-end', d=>`url(#arrow${fixName2Class(d.name===colorMode?'blue':'black')})`)
            .attr('stroke',d=>d.name===colorMode?'blue':'black');
        g.select('.axisHolder').selectAll('text.axis').data(axis)
            .join('text')
            .attr('class','axis')
            .attr('x',d=>xscale((d.x2-d.x1)*d.scale+d.x1))
            .attr('y',d=>yscale((d.y2-d.y1)*d.scale+d.y1))
            .attr('dx',d=>d.x2>0?6:-6)
            .attr('dy',d=>d.y2>0?16:-6)
            .text(d=>d.name)
            .attr('stroke',d=>d.name===colorMode?'blue':'black');

        return master;
    };
    master.feature = function(_data) {
        if(arguments.length){
            feature = _data;
            return master;
        }else
            return feature
    }
    master.data = function(_data) {
        if (arguments.length){
            data = _data.data;
            dataArr = _data.dataArr;
            calFunc();
            return master;
        }else
            return {data,dataArr};
    }
    master.colorMode = function(_data) {
        if (arguments.length){
            colorMode = _data;
            master.draw();
            return master;
        }else{
            return colorMode
        }
    }
    master.vizMode = function(_data) {
        if (arguments.length){
            // change vizMode
            vizMode = _data;
            debugger
            switch (_data) {
                case 'umap':
                    calFunc = cal_UMAP;
                    break;
                case 'tsne':
                    calFunc = cal_tSNE;
                    break;
                default:
                    calFunc = cal_PCA;
                    break;
            }
            calFunc();
            reset();
            master.draw();
        }else
            return vizMode;
    };
    master.graphicopt = function(_data) {
        if (arguments.length){
            d3.keys(_data).forEach(k=>graphicopt[k]=_data[k]);
            return master;
        }else
            return graphicopt;
    };
    return master;
}

function fixName2Class(s) {
    return 'h'+s.replace(/ |#|\./gi,''); //avoid . and number format
}
