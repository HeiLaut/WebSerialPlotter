class Value{
  constructor(name,posX,posY){
    this.name = name;
    this.data = [];
    this.posX = posX;
    this.posY = posY;
  }
  del(n){
    this.data = this.data.slice(-n);
  }
  lastElement(){
    return this.data.slice(-1);
  }
}
