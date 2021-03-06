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
    let isFreeze = false;
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
            .attr('height',graphicopt.height)
            .on('click',()=>{if (isFreeze){
                const func = isFreeze;
                isFreeze = false;
                func();
            }});
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
        // legend
        makelegend();

        return master
    }
    function makelegend(){
        // legend
        const marginTop = 0;
        const marginBottom = 0;
        const marginLeft = 10;
        const marginRight = 10;
        const width = 250;
        const height = 21;
        const svg = d3.select('#legendColor')
            .attr('width', width + marginLeft + marginRight)
            .attr('height', height + marginTop + marginBottom);
        svg.select('g.legend').remove();
        let legend = svg.append('g').attr('class', 'legend')
            .attr('transform', `translate(${marginLeft},${marginTop})`);

        let y = Object.assign(color.copy()
                .interpolator(d3.interpolateRound(width, 0)),
            {
                range() {
                    return [0, width];
                }
            });

        legend.append("image")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.interpolator()).toDataURL());


            graphicopt.legend = {scale: y};
            legend.append('g').attr('class', 'legendTick').call(d3.axisBottom(y).ticks(3))
                .selectAll('text').attr('dx',(d,i)=>i===0?6:(i===2?-6:0))
                .text(d=>d==='0.0'?0:(d==='1.0'?1:d));



        function ramp(color, n = 256) {
            const canvas = createContext(n, 1);
            const context = canvas.getContext("2d");
            for (let i = 0; i < n; ++i) {
                context.fillStyle = color((1-i / (n - 1)));
                context.fillRect(i, 0, 1, 1);
            }
            return canvas;
        }

        function createContext(width, height) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            return canvas;
        }
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
    function freezeHandle(){
        if (isFreeze){
            const func = isFreeze;
            isFreeze = false;
            selectedTarget = undefined;
            func();
        }else{
            isFreeze = true;
            isFreeze = (function(){d3.select(this).dispatch('mouseout')}).bind(this);
            d3.event.stopPropagation();
        }
    }
    master.draw = function(){
        const items = g.select('.drawArea').selectAll('g.item')
            .data(data,d=>d.id)
            .join('g')
            .attr('class','item')
            .attr('transform',d=>`translate(${xscale(d.x)},${yscale(d.y)})`)
            .on('click',function(d){d3.select(this).dispatch('mouseover') ;freezeHandle.bind(this)();})
            .on('mouseover',function(d){
                if (!isFreeze) {
                    const part = d.id.split('/');
                    const title = part[2]+'/'+part[3];
                    d3.select('#detailItem')
                        .selectAll('img')
                        .data([d])
                        .join('img')
                        .attr('src', d.id)
                        .attr('class', 'img-fluid')
                        .on('click',function(d){
                            d3.select('#detailImages').select('#detailImagesLabel').text(title);
                            debugger
                            let holders= d3.select('#imageHolder')
                                .selectAll('div.holder').data([{title:'main',src:d.id},...concepts.map((c,i)=>({title:`${c} = ${Math.round (d[c]*100)/100}`,src:`data/img_highlighted/${d.id.split('/')[2]}/concept_${i}/${d.id.split('/')[3].replace('jpg','png')}`}))])
                                .join('div')
                                .attr('class','col-3 holder');
                            holders.selectAll('img').data(d=>[d]).join('img')
                                .attr('class', 'img-fluid')
                                .attr('src', d=>d.src);
                            holders.selectAll('h6').data(d=>[d]).join('h6')
                                .style('text-align', 'center')
                                .text( d=>d.title);
                            $('#detailImages').modal('show')
                        });
                    d3.select('#detailItem')
                        .selectAll('h6.imageTitle')
                        .data([d])
                        .join('h6')
                        .attr('class', 'imageTitle')
                        .text(title);
                    g.select('.drawArea').selectAll('g.item').style('opacity', 0.1);
                    d3.select(this).style('opacity', 1);
                    updateViolinCurve(d);
                }
            })
            .on('mouseleave',function(d){
                if (!isFreeze) {
                    d3.select('#detailItem').selectAll('*').remove();
                    g.select('.drawArea').selectAll('g.item').style('opacity', null);
                    updateViolinCurve();
                }
            });
        items.selectAll('circle')
            .data(d=>[d])
            .join('circle')
            .attr('r',5)
            .attr('fill',d=>color(d[colorMode]));
        items.selectAll('image')
            .data(d=>[d])
            .join('image')
            .style('display',graphicopt.drawMode==='image'?'block':'none')
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
            .attr('stroke',d=>d.name===colorMode?'blue':'black')
            .style('font-size','18');

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
    master.drawMode = function(_data) {
        if (arguments.length){
            graphicopt.drawMode = _data;
            master.draw();
            return master;
        }else{
            return graphicopt.drawMode
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
