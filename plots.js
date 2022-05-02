function drawDia(){
  PLOT = document.getElementById('plot');
  //let nameY = labelY[0];
  //let nameY2 = labelX[0];
  var trace1 ={
    x: x,
    y: y,
    name: labelY,
    type: 'scatter'
  }

  var trace2 = {
    x: x,
    y: y2,
    name:labelY2,
    yaxis: 'y2',
    type: 'scatter'
  }


  var data = [trace1,trace2];
  var layout = {
    xaxis:{
      title: labelX,
      titlefont:
      {
        size:18
      },
      gridcolor: '#bdbdbd',

      tickfont:{
        size:18,
      }
    },
    yaxis:{
      title: labelY,
      titlefont:
      {
        size:18
      },
      gridcolor: '#bdbdbd',

      tickfont:{
        size:18,
      }
    },
    yaxis2: {
      title: labelY2,
      titlefont: {size:18,color:'#ff7f0e'},
      tickfont: {size:18,color:'#ff7f0e'},
      overlaying: 'y',
      side: 'right'

    }
    }
if(paramY2 == undefined){
  trace2 = {};
  delete layout.yaxis2;
  data = [trace1];
}
	Plotly.newPlot( PLOT, data,layout,{displaylogo: false});
}
