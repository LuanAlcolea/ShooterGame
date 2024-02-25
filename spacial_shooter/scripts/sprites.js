export function facingRight(obj){
    if(obj.sprite.startx == 0) { return true;}
    return false;
}
export function flip(obj, side){
    if(side == -1){
        obj.sprite.startx = obj.sprite.endx;
        obj.sprite.endx = 0;
        //obj.dir.x = -1;
    } else if(side == 1){
        obj.sprite.endx = obj.sprite.startx;
        obj.sprite.startx = 0;
        //obj.dir.x = 1;
    }
}
