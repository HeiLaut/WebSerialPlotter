class Value{
  constructor(name,posX,posY,id){
    this.name = name;
    this.data = [];
    this.posX = posX;
    this.posY = posY;
    this.id = id;
    this.window = new Window(this.posX,this.posY,this.name + ": "+ this.data.slice(-1),colors[this.id]);
  }
  del(n){
    this.data = this.data.slice(-n);
  }
  lastElement(){
    return this.data.slice(-1);
  }
}
