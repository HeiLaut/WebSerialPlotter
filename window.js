class Window{
  constructor(x,y,dat,col){
    textSize(20);
    this.x = x,
    this.y = y,
    this.px = x,
    this.py = y,
    this.dat = dat,
    this.width = textWidth(dat)+10,
    this.txtSz = 20;
    this.height = this.txtSz+30,
    this.bgcolor = col,
    this.resizeRect = 15,
    this.txt = dat,
    this.mx = x,
    this.my = y
    this.moving = false,
    this.scaling = false
  }
  draw(){
    fill(this.bgcolor);
    rect(this.x,this.y,this.width,this.height);
    rect(this.x+this.width-this.resizeRect,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect);
    textAlign(LEFT,TOP)
    fill("black")
    textSize(this.txtSz);
    text(this.txt,this.x+5,this.y+5);
    this.checkPressed();
  }
  checkPressed(){
    if(this.moving){
      this.move();
    }
    if(this.scaling){
      this.scale();
    }
    if(!mouseIsPressed){
    this.mx = mouseX;
    this.my = mouseY;
    }
    if(mouseIsPressed){
      if(this.mouseInsideRect(this.x+this.width-this.resizeRect,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect)){
        this.scaling = true;
      }
      else if(this.mouseInsideRect(this.x,this.y,this.height,this.width)){
        if(!this.scaling){
        this.moving=true;
      }
      }
  }else{
    this.moving = false,
    this.scaling = false,
    this.px = this.x;
    this.py = this.y;
  }
  }
  mouseInsideRect(x,y,h,w){
    return (mouseX>x && mouseX < x+w && mouseY>y && mouseY<y+h)
  }
    move(){
      this.x = mouseX-(this.mx-this.px);
      this.y = mouseY-(this.my-this.py);
      if(this.x<0){
        this.x = 0;
      }
      if(this.y<0){
        this.y=0;
      }
      if((this.x+this.width)>width){
        this.x = width-this.width;
      }
       if((this.y+this.height)>height){
        this.y = height-this.height;
      }
    }
  scale(){
        this.width=mouseX-this.x+7;
        this.height=this.txtSz+30;;
        this.txtSz = this.width/5;
        if(this.height<this.txtSz){
         this.height = this.height+10;
          this.scaling=false;
        }
        if(this.width < textWidth(this.txt)){
           this.width = textWidth(this.txt)+10;
           }

  }
}
