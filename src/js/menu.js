function initMenu(){
    $('#legendHolder').draggable({ handle: ".card-header" ,containment: "parent", scroll: false });
    d3.select('#vizMode').on('change',function(){
        viz.vizMode(this.value);
    });
    d3.select('#itemMode')
        .on('change',function(){
            viz.drawMode(this.value);
        })
    d3.select('#colorMode')
        .on('change',function(){
            viz.colorMode(this.value);
        })
        .selectAll('option')
        .data(['metric',...concepts])
        .join('option')
        .attr('value',d=>d)
        .text(d=>d);

    let axis = ['metric',...concepts];
    const conceptHolder = d3.select('#conceptSVG')
        .attr('width','100%')
        .attr('height',violiin_chart.graphicopt().height*axis.length)
        .selectAll('.metricSum')
            .data(axis)
            .join('g')
            .attr('class','metricSum')
            .attr('transform',(d,i)=>`translate(${0},${violiin_chart.graphicopt().height*i})`);
    conceptHolder.selectAll('text.labelM')
        .data(d=>[d])
        .join('text')
        .attr('y',violiin_chart.graphicopt().height/2)
        .attr('class','labelM')
        .text(d=>d);
    conceptHolder.selectAll('g')
        .data(d=>[d])
        .join('g')
        .attr('transform',`translate(${70},0)`)
        .attr('class','plotHolder');
    drawviolin();
}

function updateProcess(message,div){
    div = div?? ".cover";
    const holder=d3.select(div);
    holder.classed('hide', !message);
    if (message){
        holder.select('.progress-bar')
            .style("width", `${message.percentage}%`)
            .attr('aria-valuenow',message.percentage);
        holder.select('.processText').text(message.text??'');
    }
}
function updateViolinCurve(d){
    if(d){
        let axis = ['metric',...concepts];
        let xscale = d3.scaleLinear().range([0,violiin_chart.graphicopt().widthG()]);
        d3.select('#conceptSVG').selectAll('path.item').data([d])
            .join('path')
            .attr('class','item')
            .attr('fill','none')
            .attr('stroke','red')
            .attr('transform',`translate(${70+violiin_chart.graphicopt().margin.left},${violiin_chart.graphicopt().height*0.5})`)
            .attr('d',d=>d3.line().x(d=>xscale(d)).y((d,i)=>violiin_chart.graphicopt().height*i)(axis.map(a=>d[a])))
    }else{
        d3.select('#conceptSVG').select('path.item').remove();
    }
}
function drawviolin(){
    violiin_chart.graphicopt({isStack: false});
    plotViolin(d3.selectAll('#conceptSVG .metricSum'));
}

function plotViolin(holder) {
    let selected = data;
    // violiin_chart.graphicopt({width:violin_w,height:h});
    setTimeout(() => {
        let dimGlobal = [0, 0];
        let dimensiondata = {};
        holder.data().forEach(d => {
            let color = () => "#ddd";

            let value = [];

            value = [axisHistogram(d, [0,1], selected.map(e => e[d]))];
            vMax = d3.max(value[0], d => d[1]);
            dimGlobal[1] = Math.max(vMax, dimGlobal[1]);

            dimensiondata[d] = {key: d, value: value, color: color};
        });
        holder.select('.plotHolder')
            .each(function (d) {
                if (dimensiondata[d]) {
                    violiin_chart.graphicopt({
                        customrange: [0,1],
                        rangeY: dimGlobal,
                        color: dimensiondata[d].color
                    }).data(dimensiondata[d].value).draw(d3.select(this))
                }
            })
    }, 0)
}
function axisHistogram(text,range,d){
    d = d.filter(e=>e)
    if (d.length) {
        outlierMultiply = 3
        var scale = d3.scaleLinear().domain(range);
        var histogram = d3.histogram()
            .domain(scale.domain())
            // .thresholds(d3.range(0,20).map(d=>scale(d)))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .thresholds(scale.ticks(100))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);
        let hisdata = histogram(d);

        let start=-1,startcheck=true,end= hisdata.length-1;
        let sumstat = hisdata.map((d, i) => {
            let temp = [d.x0 + (d.x1 - d.x0) / 2, (d || []).length];
            if (startcheck && temp[1]===0)
                start = i;
            else {
                startcheck = false;
                if (temp[1]!==0)
                    end = i;
            }
            return temp});
        if (start===end)
            sumstat = [];
        else
            sumstat = sumstat.filter((d,i)=>i>start&&i<=end);
        r = {
            axis: text,
            q1: ss.quantile(d, 0.25),
            q3: ss.quantile(d, 0.75),
            median: ss.median(d),
            // outlier: ,
            arr: sumstat
        };
        // if (d.length>4)
        // {
        //     const iqr = r.q3-r.q1;
        //     console.log('Outliers: ',d.filter(e=>e>(r.q3+outlierMultiply*iqr)||e<(r.q1-outlierMultiply*iqr)).length);
        //     r.outlier = _.unique(d.filter(e=>e>(r.q3+outlierMultiply*iqr)||e<(r.q1-outlierMultiply*iqr)));
        //     console.log('Unquie points: ',r.outlier.length);
        // }else{
        //     r.outlier =  _.unique(d);
        // }
        r.outlier = []
        return r;
    }else{
        return  {
            axis: text,
            q1: null,
            q3: null,
            median: null,
            // outlier: ,
            arr: []
        };
    }
}
