class Window{
  constructor(x,y,dat,col,id){
    textSize(20);
    this.id = id,
    this.x = x,
    this.y = y,
    this.px = x,
    this.py = y,
    //this.dat = dat,
    this.width = textWidth(dat)+100,
    this.txtSz = 20;
    this.height = this.txtSz+30,
    this.bgcolor = col,
    this.resizeRect = 20;
    this.txt = dat,
    this.mx = x,
    this.my = y
    this.moving = false,
    this.scaling = false,
    this.mousePressed = false,
    this.show = true
  }
  draw(){
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
    fill(this.bgcolor);

    if(this.show){
      rect(this.x,this.y,this.width,this.height);

      //minimize button
      rect(this.x+this.width-this.resizeRect,this.y,this.resizeRect,this.resizeRect);

      //offset button
      if(values[this.id].offset == 0){
        noFill();
      }else{
        fill("grey");
      }
      rect(this.x+this.width-this.resizeRect,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect);

      noFill();
      //textsize buttons
      rect(this.x,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect);
      rect(this.x+this.resizeRect,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect);

      fill("black")
      textSize(14);
      textAlign(CENTER,BOTTOM);
      text("A+ ",this.x+this.resizeRect/2+2, this.y+this.height-2);

      textSize(12);
      text("A- ",this.x+this.resizeRect*1.5+2, this.y+this.height-2);
      text("OS ",this.x+this.width-9, this.y+this.height-2);

      textAlign(CENTER,TOP);
      textSize(20);
      text("_",this.x+this.width-this.resizeRect/2,this.y-10);
      textAlign(LEFT,TOP);
      textSize(this.txtSz);
      text(this.txt,this.x+5,this.y+5);
    }else{
      rect(this.x+this.width-this.resizeRect,this.y,this.resizeRect,this.resizeRect);
      fill("black")
      textAlign(CENTER,TOP);
      textSize(14);
      text(this.txt[0],this.x+this.width-this.resizeRect/2,this.y+5);
    }
    this.checkPressed();

  }
  checkPressed(){
    if(this.moving){
      this.move();
    }
  if(!mouseIsPressed){
    this.mx = mouseX;
    this.my = mouseY;
    this.mousePressed = false;
    }
  if(mouseIsPressed){
    if(this.mouseInsideRect(this.x+this.width-this.resizeRect,this.y,this.resizeRect,this.resizeRect)){
      if(this.show && !this.mousePressed && !anymoves ){
      this.show = false;
      this.mousePressed = true;}
      else if (!this.show && !this.mousePressed && !anymoves) {
      this.show = true;
      this.mousePressed = true;}
      }
     else if(this.mouseInsideRect(this.x,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect)){
       if(!this.moving && !anymoves && !this.mousePressed){
         this.scale(5);
         this.mousePressed = true;
       }
     }
     else if(this.mouseInsideRect(this.x+this.resizeRect,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect)){
       if(!this.moving && !anymoves&& !this.mousePressed){
         this.scale(-5);
         this.mousePressed = true;
       }
     }else if(this.mouseInsideRect(this.x+this.width-this.resizeRect,this.y+this.height-this.resizeRect,this.resizeRect,this.resizeRect)){
       if(!this.moving && !anymoves&& !this.mousePressed){
         if(values[this.id].offset!=0){
           values[this.id].offset = 0;
         }else{
           values[this.id].offset=values[this.id].data.slice(-1);
        }
         this.mousePressed = true;

       }
     }else if(this.mouseInsideRect(this.x,this.y,this.height,this.width)){
        for(el of values){
          if(el.window.moving){
            anymoves = true;
          }
        }
        if(!anymoves && this.show){
          this.moving = true;
        }
      }
    }else{
    this.moving = false,
    this.scaling = false,
    anymoves = false;
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
      let grid = 10;
      this.x = round(this.x/grid)*grid
      this.y = round(this.y/grid)*grid

    }
  scale(d){
      this.txtSz += d;
      this.width = textWidth(this.txt) + 100;
      this.height = this.txtSz + 30;
      this.y -= d;
  }
  // intersect(obj){
  //   if(this.x < obj.x + obj.width &&
  //       this.x + this.width > obj.x &&
  //       this.y < obj.y + obj.height &&
  //       this.height + this.y > obj.y){
  //         this.intersecting = true;
  //           if(this.x<obj.x+obj.width && this.x+ this.width > obj.x + obj.width){
  //             this.x +=10;
  //           }else if(this.x+this.width>obj.x){
  //             this.x -=30;
  //           }if(this.y < obj.y + obj.height && this.y + this.height > obj.y+ obj.width){
  //             this.y +=10;
  //
  //           }else{this.y -= 10;print("now");
  //           }
  //
  //
  //       }
  //
  // }
}
