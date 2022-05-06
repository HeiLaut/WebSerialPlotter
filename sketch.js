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
let colors =  ["#96ceb4","#ffeead","#ffcc5c","#ff6f69"];
let values =[]; //Array for Data Objects
let d1,d2;
let frame = 0;
let canvas,plot;

function setup() {
  canvas = createCanvas(1200,500);
  plot = select('#plot')
  canvas.position(0,600);
  plot.position(0,20);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional


  pauseButton = createButton('Run/ Pause (p)');
  pauseButton.position(800, 50);
  pauseButton.style("width","150px")
  pauseButton.mousePressed(togglePause);

  resetButton = createButton('Reset Data (r)');
  resetButton.position(800, 100);
  resetButton.style("width","150px")
  resetButton.mousePressed(resetData);

  csvButton = createButton('Save CSV-File');
  csvButton.position(800,150  );
  csvButton.style("width","150px")
  csvButton.mousePressed(saveCsv);

  serialButton = createButton('Open Serial Connection');
  serialButton.position(10,10);
  serialButton.mousePressed(openSerialPort)



  dataSlider = createSlider(100, 5000, 1000, 100);
  dataSlider.position(plot.x+10, plot.y + 500);
  dataSlider.style('width', '300px');

  closeButton = createButton('Close Serial Connection');
  closeButton.position(0,plot.y+height+canvas.y);
  closeButton.style('font-size','10px');
  closeButton.style('background-color','#8B0000');
  closeButton.mousePressed(closeSerialPort);

  selectX = createSelect();
  selectX.changed(selectXChanged);
  selectX.position(20,20);

  selectY = createSelect();
  selectY.changed(selectYChanged);
  selectY.position(150,20);

  selectY2 = createSelect();
  selectY2.changed(selectY2Changed);
  selectY2.option("not defined")
  selectY2.position(280,20);



  pHtmlMsg = createP("No Serial Device Connected");
  pHtmlMsg.position(0,plot.y+height+canvas.y+20);
  sliderTxt = createP("Number of Data Points: ");
  sliderTxt.position(plot.x+12,plot.y + 460);
  sliderValue = createP(dataSlider.value());
  sliderValue.position(plot.x+180,plot.y + 460)


    dataTable = new p5.Table();

}



function draw() {
  background(255);
  frame+=1;

  if(serial.isOpen()){
    serialButton.position(-300,0);
  }else{
    serialButton.position(10,10);
  };

 if(!pause){
   drawDia();
   pauseButton.style("background-color","#008CBA");

  }

  if(pause){
    pauseButton.style("background-color","green");
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


function drawSerialData(){
  textSize(20);
  textAlign(LEFT);
  for(let i = 0; i < values.length; i++){
    let el = values[i]
    // text(el.name+':',el.posX,el.posY)
    // text(el.lastElement(),el.posX+el.name.length*12,el.posY)
    el.window.draw();
    el.window.txt = el.name + ": "+ el.data.slice(-1);
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
    a =new Value(data[i],20+100*i,30);
    values.push(a);}
}

function storeData(){
  try{
    for(let i=0;i < values.length;i++){
      values[i].data.push(data[2*i+1]);
      values[i].del(dataSlider.value());
    }

  }catch{}
}

function onSerialDataReceived(eventSender, newData) {
  data = newData.split(',');
  //called first time data are received and creates buttons for each data.
  if(!receivedData){
    setTimeout(createDataObjects,1000);
    setTimeout(createSelectionParameters, 1000);
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
  if(key == 't'){
    if(canvas.y != 0){
    canvas.position(0,0);
    plot.position(0,500);
  }else{
    canvas.position(0,500);
    plot.position(0,0);
  }
    dataSlider.position(plot.x+10, plot.y + 500);
    sliderTxt.position(plot.x+12,plot.y + 460);
    sliderValue.position(plot.x+180,plot.y + 460);


  }
}



function togglePause(){
   if(pause){
      pause = false;
    }else{
    pause = true;}

}

function resetData(){
  for(let i =0; i < values.length; i++){
    values[i].data = [];
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
