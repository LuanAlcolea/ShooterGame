export let pad = Pads.get();
export let oldpad = pad;

export function UpdatePad(){
    oldpad = pad;
    pad = Pads.get();
}
export function GetPad(padbutton){
    if(Pads.check(pad, padbutton)) return true;
    return false;
}
export function GetPadDown(padbutton){
    if(Pads.check(pad, padbutton) && !Pads.check(oldpad, padbutton)) return true;
    return false;
}
export function GetRightJoyX(){
    return pad.rx;
}
export function GetRightJoyY(){
    if(pad.ry != -1) return pad.ry;
    else return 0;
}
export function GetLeftJoyX(){
    return pad.lx;
}
export function GetLeftJoyY(){
    return pad.ly;
}