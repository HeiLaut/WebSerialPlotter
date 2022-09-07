// This is a web serial plotter for serial data coming from arduino devices
// By Heinrich Lauterbach
// based on an basic serial template by Jan E. Froehlich
//https://makeabilitylab.github.io/physcomp/

//Todo:
// - add Objects for Each data including data and Buttons (complicated!)
//
let pHtmlMsg, sliderTxt, sliderValue;
let serialOptions = { baudRate: 115200  };
let serial;

let paramX = 0;
let paramY = 1;
let paramY2;
let dataTable;
let receivedData = false;
let data = []; //list of incoming data
let pause = false;
//let colors =  ["#96ceb4","#ffeead","#ffcc5c","#ff6f69"];
let colors = ["#3c9eff","#ff445d","#f8d248","#5bcca0","#aaaaaa"]
let values =[]; //Array for Data Objects
let canvas,plot;
/**anymoves regocnizes if any if the object ist moving. When this is the cas the
other objects dont move or scale. Needs an other solution than a
global variable. At the moment i have no better approach. maybe i need a values class*/
let anymoves = false;
let diagramAndControls = [];

let timeOffset=0;

function setup() {
  canvas = createCanvas(1200,600);
  canvas.position(0,600);

  //plot = select('#plot')
  plot = createDiv();
  plot.id('plot');
  plot.style("width","800px");
  plot.style("height","500px");
  plot.position(0,50);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional


  pauseButton = createButton('Pause (p)');
  pauseButton.position(800, 50);
  pauseButton.style("width","150px")
  pauseButton.mousePressed(togglePause);

  resetButton = createButton('Reset Data (r)');
  resetButton.position(800, 100);
  resetButton.style("width","150px")
  resetButton.mousePressed(resetData);

  restartButton = createButton('Restart t=0 (n)')
  restartButton.position(800,250)
  restartButton.style("width","150px");
  restartButton.mousePressed(restartTimer)

  csvButton = createButton('Save CSV-File');
  csvButton.position(800,150  );
  csvButton.style("width","150px")
  csvButton.mousePressed(saveCsv);

  serialButton = createButton('Open Serial Connection');
  serialButton.position(10,10);
  serialButton.mousePressed(openSerialPort)

  closeButton = createButton('Close Serial Connection');
  closeButton.position(800,200);
  closeButton.style('font-size','10px');
  closeButton.style('background-color','#8B0000');
  closeButton.mousePressed(closeSerialPort);



  dataSlider = createSlider(100, 5000, 1000, 100);
  dataSlider.position(plot.x+10, plot.y + 500);
  dataSlider.style('width', '300px');


  selectX = createSelect();
  selectX.changed(selectXChanged);
  selectX.position(40,plot.y + 550 );
  let aX = createP("<b>x:</b> ");
  aX.style("font-size","20px");
  aX.position(20,plot.y + 526 );

  selectY = createSelect();
  selectY.changed(selectYChanged);
  selectY.position(160,plot.y + 550 );
  let aY = createP("<b>y:</b> ");
  aY.style("font-size","20px");
  aY.position(140,plot.y + 526 );

  selectY2 = createSelect();
  selectY2.changed(selectY2Changed);
  selectY2.option("not defined")
  selectY2.position(310,plot.y + 550);
  let aY2 = createP("<b>y2:</b> ");
  aY2.style("font-size","20px");
  aY2.position(280,plot.y + 526 );



  pHtmlMsg = createP("No Serial Device Connected");
  pHtmlMsg.position(20,plot.y+height+canvas.y+20);
  sliderTxt = createP("Number of Data Points: ");
  sliderTxt.position(plot.x+12,plot.y + 460);
  sliderValue = createP(dataSlider.value());
  sliderValue.position(plot.x+180,plot.y + 460)

  let diaOff = createButton("Diagramm on/off");
  diaOff.position(800,500);
  diaOff.mousePressed(hideShowDia)


  dataTable = new p5.Table();

  diagramAndControls.push(sliderTxt,sliderValue,dataSlider,plot,selectY,selectY2,selectX,aX,aY,aY2);
}


function hideShowDia(){
  let canvasPos;
  for(let el of diagramAndControls){
    if(el.style("display")=='block'){
    el.style("display","none");
     canvasPos = 0;
    }else{
    el.style("display","block");
      canvasPos = 600;
  }
  }
  canvas.position(0,canvasPos)
}

function restartTimer(){
  values[0].offset=values[0].last;
  resetData();
  pause=false;
}

function draw() {
  background(255);


  if(serial.isOpen()){
    serialButton.position(-300,0);
  }else{
    serialButton.position(10,10);
  };

 if(!pause){
   drawDia();
   pauseButton.style("background-color","#008CBA");
   pauseButton.html("Pause (p)")

  }

  if(pause){
    pauseButton.style("background-color","green");
    pauseButton.html("Run (p)")
  }
  drawSerialData();
  textSize(16);
  textAlign(CENTER)
  sliderValue.html(dataSlider.value());

}


function createSelectionParameters(){
  for(let i = 0; i < values.length; i++){
    let el = values[i];
    //make option for drop down selection
    selectX.option(i + ": "+ el.name);
    selectY.option(i + ": "+ el.name);
    selectY2.option(i + ": "+ el.name);
  }
  selectY.selected(1 + ": "+ values[1].name);
}

function selectXChanged() {
  paramX = selectX.value()[0]
}
function selectYChanged() {
  paramY = selectY.value()[0]
}

function selectY2Changed() {
  if(selectY2.value() === "not defined"){
    paramY2 = undefined;
  }else{
    paramY2 = selectY2.value()[0];
  }
}



/**
00px; * Callback function by serial.js when there is an error on web serial
 *
 * @param {} eventSender
 */

 function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}


function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  //receivedData = false;
  pHtmlMsg.html("Serial connection closed");
}

function createDataObjects(){
  for(let i = 0; i < data.length; i = i+2){
    a =new Value(data[i],20+100*i,30,i/2);
    values.push(a);}
}

function storeData(){
  try{
    for(let i=0;i < values.length;i++){
      let lastitem = data[2*i+1]
      values[i].data.push(lastitem-values[i].offset);
      values[i].del(dataSlider.value());
      values[i].last = lastitem;
    }

  }catch{}
}


function drawSerialData(){
  for(el of values){
    el.window.draw();
    let value =  round(el.data.slice(-1),2);
    el.window.txt = el.name + ": " + value;
  }
}

function onSerialDataReceived(eventSender, newData) {
  data = newData.split(',');
  //called first time data are received and creates buttons for each data.
  if(!receivedData){
    setTimeout(createDataObjects,2000);
    setTimeout(createSelectionParameters, 2000);
    receivedData=true;
  }
  if(!pause){
  storeData()
  }
}

/**
 * Called automatically by the browser through p5.js when connect-button is clicked
 */
function openSerialPort() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }

}

function closeSerialPort(){
  serial.close();
  resetData();
}

function keyPressed(){
  if(key=='p'){
   togglePause();
  }
  if(key == 'r'){
    resetData();
  }
  if(key == 'n'){
    restartTimer();
  }
}

function togglePause(){
   if(pause){
      pause = false;

    }else{
      pause = true;

  }

}

function resetData(){
  for(el of values){
    el.data = [];
  }

    drawDia();
}


function saveCsv(){
  dataTable.clearRows()

  for(let i = 0; i < values.length;i++){
    dataTable.removeColumn(values[i].name);
    dataTable.addColumn(values[i].name);
  }
  for(let k=0;k<values[0].data.length;k++){
    let newRow = dataTable.addRow();
    for(let n = 0; n < values.length; n++){
      newRow.setString(values[n].name, values[n].data[k]);
    }
    }


  saveTable(dataTable, 'data.csv');

}
