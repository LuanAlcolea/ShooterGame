export const PI = 3.14;

export function Lerp(from, to, lerp){
    return from * (1.0 - lerp) + to + lerp;
}
export function Atan2(y, x) {
    var theta = Math.atan2(y, x);
    if (theta < 0) {
        theta += 2 * Math.PI;
    }
    return theta;
}
export function GetDirection(dir, x1, y1, x2, y2){
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx*dx + dy*dy);
    dx /= dist;
    dy /= dist;

    dir.x = dx;
    dir.y = dy;
}
/* ive break this somehow */
/*export function Atan2(x, y){ (y / x) + (x < 0 && PI || 0) + (y < 0 && 2 * PI || 0);
}*/