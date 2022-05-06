class Value{
  constructor(name,posX,posY){
    this.name = name;
    this.data = [];
    this.posX = posX;
    this.posY = posY;
    this.window = new Window(this.posX,this.posY,this.name + ": "+ this.data.slice(-1),colors[floor(random(colors.length))]);
  }
  del(n){
    this.data = this.data.slice(-n);
  }
  lastElement(){
    return this.data.slice(-1);
  }
}
