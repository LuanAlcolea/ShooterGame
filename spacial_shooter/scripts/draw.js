export let currentCam = {x:0, y:0};
export function setCam(newCam){
    currentCam = newCam;
}
export function World2Screen(x, y, cam){
    return [x-cam.x, y-cam.y]
}
export function rect(x, y, w, h, color){
    let pos = World2Screen(x, y, currentCam);
    Draw.rect(pos[0], pos[1], w, h, color);
}
export function circle(x, y, size, color){
    let pos = World2Screen(x, y, currentCam);
    Draw.circle(pos[0], pos[1], size, color, true);
}
export function img(sprt, x, y){
    let pos = World2Screen(x, y, currentCam);
    sprt.draw(pos[0], pos[1]);
}