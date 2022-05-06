// This is a web serial plotter for serial data coming from arduino devices
// By Heinrich Lauterbach
// based on an basic serial template by Jan E. Froehlich
//https://makeabilitylab.github.io/physcomp/

//Todo:
// - add Objects for Each data including data and Buttons (complicated!)
//
let pHtmlMsg;
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

function setup() {
  createCanvas(1200,500);
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
  dataSlider.position(10, 650);
  dataSlider.style('width', '300px');

  closeButton = createButton('Close Serial Connection');
  closeButton.position(0,720);
  closeButton.style('font-size','10px');
  closeButton.style('background-color','#8B0000');
  closeButton.mousePressed(closeSerialPort);

  dataTable = new p5.Table();

  d1 = new Window(100,150,"TEXT",colors[2])
  d2 = new Window(400,150,"TEXT",colors[1])

}



function draw() {
  background(255);
  frame+=1;

  if(serial.isOpen()){
    serialButton.position(-300,0);
  }else{
    serialButton.position(10,10);
  };


  try{
    if(frame%10 == 0){
    d1.txt = values[1].name +": "+ values[1].data.slice(-1);
    d2.txt = values[2].name +": "+ values[2].data.slice(-1);
  }
  }catch{}

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
  d1.draw()
  d2.draw()
}

function createButtons(){
  for(let i = 0; i < values.length; i++){
    let el = values[i];
    let bx = createButton('x');
    let by = createButton('y');
    let by2 = createButton('y2');
    bx.position(el.posX, 580);
    by.position(20+el.posX, 580);
    by2.position(40+el.posX, 580);
    bx.style("font-size","14px");
    bx.style("padding","5px 5px");
    by.style("font-size","14px");
    by.style("padding","5px 5px");
    by2.style("font-size","14px");
    by2.style("padding","5px 5px");
    bx.mousePressed(function(){selectData('x',i)});
    by.mousePressed(function(){selectData('y',i)});
    by2.mousePressed(function(){selectData('y2',i)});
    el.buttonX = bx;
    el.buttonY = by;
    el.buttonY2 = by2;


  }
  values[0].buttonX.style("background-color","red");

  values[1].buttonY.style("background-color","red");
}

function drawSerialData(){
  textSize(20);
  textAlign(LEFT);
  for(let i = 0; i < values.length; i++){
    let el = values[i]
    text(el.name+':',el.posX,el.posY)
    text(el.lastElement(),el.posX+el.name.length*12,el.posY)
  }
}


function selectData(ax,dat){
  /** gets the axis and the postition of the data in the data-Array. 0, 2, 4 ...
  */
  if(ax == 'x'){

    if(paramX != dat){
      paramX = dat;
      for(let i=0; i<values.length;i++){
        values[i].buttonX.style("background-color","#008CBA");
      }
      values[dat].buttonX.style("background-color","red");
    }
   }else if (ax =='y') {

     if(paramY != dat){
       paramY = dat;
       for(let i=0; i<values.length;i++){
         values[i].buttonY.style("background-color","#008CBA");
       }
       values[dat].buttonY.style("background-color","red");

     }else{
      // paramY = undefined;
     }
  }else{
    for(let i=0; i<values.length;i++){
      values[i].buttonY2.style("background-color","#008CBA");
    }
    if(paramY2 != dat){
      paramY2 = dat;
      values[dat].buttonY2.style("background-color","red");

    }else{
      paramY2 = undefined;
    }

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
    setTimeout(createButtons, 1000);
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
