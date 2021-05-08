function initMenu(){
    $('#legendHolder').draggable({ handle: ".card-header" ,containment: "parent", scroll: false });
    d3.select('#vizMode').on('change',function(){
        viz.vizMode(this.value);
    });
    d3.select('#colorMode')
        .on('change',function(){
            viz.colorMode(this.value);
        })
        .selectAll('option')
        .data(['metric',...concepts])
        .join('option')
        .attr('value',d=>d)
        .text(d=>d);
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
