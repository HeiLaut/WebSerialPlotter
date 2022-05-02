// This is a web serial plotter for serial data coming from arduino devices
// By Heinrich Lauterbach
// based on an basic serial template by Jan E. Froehlich
//https://makeabilitylab.github.io/physcomp/

//Todo:
// - add Objects for Each data including data and Buttons
//
let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;
let x = []; //data for x-Axis
let y = []; //data for y-Axis
let y2 = []; //second y-Axis data

let labelX, labelY, labelY2;
let dataTable;
let receivedData = false;
let data = []; //list of incoming data
let pause = false;
let axisButtons = [];
let paramX, paramY, paramY2;

function setup() {
  createCanvas(1200,150);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("No Serial Device Connected");

  pauseButton = createButton('Run/ Pause (p)');
  pauseButton.position(800, 10);
  pauseButton.style("width","150px")
  pauseButton.mousePressed(togglePause);

  resetButton = createButton('Reset Data (r)');
  resetButton.position(800, 60);
  resetButton.style("width","150px")

  resetButton.mousePressed(resetData);

  serialButton = createButton('Open Serial Connection');
  serialButton.position(10,10);
  serialButton.mousePressed(openSerialPort)

  csvButton = createButton('Save CSV-File');
  csvButton.position(800,110);
  csvButton.style("width","150px")

  csvButton.mousePressed(saveCsv);
  dataSlider = createSlider(100, 5000, 1000, 100);
  dataSlider.position(10, 650);
  dataSlider.style('width', '300px');

  closeButton = createButton('Close Serial Connection');
  closeButton.position(0,720);
  closeButton.style('font-size','10px');
  closeButton.style('background-color','#8B0000');
  closeButton.mousePressed(closeSerialPort);

  dataTable = new p5.Table();

}

function draw() {

  if(serial.isOpen()){
    serialButton.position(-300,0);
  }else{
    serialButton.position(10,10);
  };

  background(220);
  let len = dataSlider.value();
  if(x.length>len){
  x = x.slice(x.length-len);
  y = y.slice(y.length-len);
  y2 = y2.slice(y2.length-len);
}
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
  text(dataSlider.value(),350,120);
  text("Number of Data Points",160,100);
}

function createButtons(){
  for(let i = 0; i < data.length-1; i  = i + 2){
    let bx = createButton('x');
    let by = createButton('y');
    let by2 = createButton('y2');
    bx.position(20+i*100, 580);
    by.position(50+i*100, 580);
    by2.position(80+i*100, 580);
    bx.style("font-size","14px");
    bx.style("padding","5px 5px");
    by.style("font-size","14px");
    by.style("padding","5px 5px");
    by2.style("font-size","14px");
    by2.style("padding","5px 5px");
    bx.mousePressed(function(){selectData('x',i)});
    by.mousePressed(function(){selectData('y',i)});
    by2.mousePressed(function(){selectData('y2',i)});
    axisButtons.push(bx,by);
  }
}

function drawSerialData(){
  textSize(20);
  textAlign(LEFT);
  for(let i = 0; i < data.length-1; i = i + 2){
    text(data[i] + ':',20+100*i,30);
    text(data[i+1],20+100*i+data[i].length*15,30);
  }
}


function selectData(ax,dat){
  /** gets the axis and the postition of the data in the data-Array. 0, 2, 4 ...
  */
  if(ax == 'x'){
    if(paramX != dat){
      paramX = dat;
    }
   }else if (ax =='y') {
     if(paramY != dat){
       paramY = dat;
     }else{
      // paramY = undefined;
     }
  }else{
    if(paramY2 != dat){
      paramY2 = dat;
    }else{
      paramY2 = undefined;
    }

  }
  //resetData()
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
  receivedData = false;
  pHtmlMsg.html("Serial connection closed");
}


function onSerialDataReceived(eventSender, newData) {
  data = newData.split(',');
  //called first time data are received and creates buttons for each data.

  if(!receivedData){
    setTimeout(createButtons, 1000);
    //createButtons();
    // parameters for the axis, default 0 - time, and 2 first data
    paramX = 0;
    paramY = 2;
    //paramY2 = -1;
    receivedData=true;

  }
  if(!pause){
  labelX=data[paramX];
  x.push(data[paramX+1]);
  labelY=data[paramY];
  y.push(data[paramY+1]);
  labelY2=data[paramY2];
  if(paramY2 != undefined){
    y2.push(data[paramY2+1]);
  }else{
    y2.push(0);
  }
  }
}

/**
 * Called automatically by the browser through p5.js when connect-button is clicked
 */
function openSerialPort() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
    createButtons();
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
}



function togglePause(){
   if(pause){
      pause = false;
    }else{
    pause = true;}
    //print(pause)
}

function resetData(){
    x=[];
    y=[];
    y2 = [];
    drawDia();
    //print('reset');

}


function saveCsv(){

  dataTable.clearRows()
  dataTable.removeColumn(labelX)
  dataTable.removeColumn(labelY)
  dataTable.removeColumn(labelY2)

  dataTable.addColumn(labelX);
  dataTable.addColumn(labelY);
  if(labelY2 != undefined){
    dataTable.addColumn(labelY2);
  }

  for(let i=0;i<x.length;i++){
    let newRow = dataTable.addRow();
    newRow.setString(labelX, x[i]);
    newRow.setString(labelY, y[i]);
    if(labelY2 != undefined){
      newRow.setString(labelY2, y2[i]);
    }
  }
  saveTable(dataTable, 'data.csv');

}
