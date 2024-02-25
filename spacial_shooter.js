// {"name": "Spacial Shooter", "author": "Luan Alcolea", "version": "12112023","file": "spacial_shooter.js"}

import * as pad from './spacial_shooter/scripts/input.js';
import * as math from './spacial_shooter/scripts/math.js';
import * as sprt from './spacial_shooter/scripts/sprites.js';
import * as draw from './spacial_shooter/scripts/draw.js';

/* -------------------- 
       GLOBAL CONST       
   -------------------- */
const BLACK     = Color.new(0, 0, 0);
const GRAY      = Color.new(127, 127, 127);
const DARK_GRAY = Color.new(16, 16, 16);
const DARK_BLUE = Color.new(0, 0, 24);
const WHITE     = Color.new(255, 255, 255);
const RED       = Color.new(255, 0, 0);
const ORANGE    = Color.new(255, 165, 0);
const GREEN     = Color.new(0, 255, 0);
const CENTER_W  = 640/2;
const CENTER_H  = 448/2;
const RIGHT     =  1;
const LEFT      = -1;
const UP        =  1;
const DOWN      = -1;
const FIX_ANGLE = 0.001; /* so this is to fix a bug */
const AIM_TIME_LIMITE = 100000 * 3;
const SPRITE_DIR = "spacial_shooter/sprites/";

/* -------------------- 
          FONTS       
   -------------------- */
let f = new Font("fonts/LEMONMILK-Regular.otf");
f.color = WHITE;

/* -------------------- 
        FUNCTIONS     
   -------------------- */

function GetResetSys(){
    if(pad.GetPadDown(Pads.L1)){
        System.loadELF(System.boot_path + "athena.elf", ["spacial_shooter.js"]);
    }
}
function Center(pos, size){
    return pos-(size/2);
}
function attachWeapon(weap, obj){
    obj.weap = weap;
    obj.using_weap = true;
}
function createBullet(x, y, tox, toy) {
    return {
        x: x,
        y: y,
        tox: tox,
        toy: toy,
        dir:{x:0, y:0},
        speed: 4,
        old_time: Timer.getTime(timer),
        current_time: 0,
        updateDir:false,
        objColliders: [],
        updateDirecion(){
            math.GetDirection(this.dir, this.x, this.y, this.tox, this.toy);
        },
        move: function() {
            /* need to place this in another line */
            if(this.updateDir == false){
                math.GetDirection(this.dir, this.x, this.y, this.tox, this.toy);
                this.updateDir = true;
            }
            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;
        },
        checkCollision: function(otherObject) {
            
        },
        checkLifetime: function() {
            this.current_time += Timer.getTime(timer) - this.old_time;
            if (this.current_time > 999999) {
                return false;
            }
            return true;
        },
        draw(){
            draw.circle(this.x, this.y, 3, GREEN);
        }
    };
}

/* -------------------- 
        CLASSES     
   -------------------- */

class Weapon{
    x = 0;
    y = 0;
    off_x = 14;
    off_y = 4;
    max_bullet = 25;
    current_bullets = this.max_bullet;
    bullets = [];
    time_to_shoot = 2;
    current_time = 0;
    sprite = new Image(SPRITE_DIR + "ss_weap.png");

    constructor(x, y, max_bullet){
        x === undefined ? this.x += 0 : this.x = x;
        y === undefined ? this.y += 0 : this.y = y;
        max_bullet === undefined ? this.max_bullet += 0 : this.max_bullet = max_bullet;
        this.current_bullets = max_bullet;
    }
    draw(){
        draw.img(this.sprite, this.x, this.y);
    }
    drawWithPos(x, y, angle){
        this.x = x + this.off_x;
        this.y = y + this.off_y;
        this.sprite.angle = angle;
        this.draw();
    }
    debug(){
        df.print(16, 6*2,  "pos_x: " + this.x + " pos_y: " + this.y + " angle: " + this.sprite.angle);
        df.print(16, 6*4,  "off_x: " + this.off_x + " off_y: " + this.off_y);
        df.print(16, 6*6,  "max_bullet: " + this.max_bullet + " bullets: " + this.current_bullets + " time shoot: " + this.time_to_shoot);
    }
    shoot(x, y, tox, toy){
        if(this.current_bullets > 0){
            this.current_bullets -= 1;
            this.bullets.push(new createBullet(x, y, tox, toy));
        }
    }
    processBullets(){
        if(this.bullets.length != 0){
            this.bullets = this.bullets.filter(bullet => bullet.checkLifetime()); 
            this.bullets.forEach(bullets => {
                bullets.move();
                bullets.draw();
            });
        }
    }
    process(){
        this.debug();
        this.processBullets();
    }
}
class Player{
    size = 24;
    x = 0;
    y = 0;
    /* centered positions */
    cx = 0;
    cy = 0;
    h_speed = 0;
    v_speed = 0;
    current_speed = 0;
    limiter = 0.7;
    facing = RIGHT;
    /* games attributes */
    speed = 2;
    health = 25;
    defense = 0;
    /* aim */
    aim_size = 3;
    aim_speed = 5;
    aim_x = 0;
    aim_y = 0;
    aux_x = 0;
    aux_y = 0;
    aim_angle = FIX_ANGLE;
    using_aim = false;
    /* sprite */
    sprite = new Image(SPRITE_DIR + "ss_cat.png");
    /* player weapon */
    weap = null;
    using_weap = true;
    /* time (usada na função da gambiarra) */
    time = 0;

    constructor(x, y){
        x === undefined ? this.x += 0 : this.x = x;
        y === undefined ? this.y += 0 : this.y = y;
        this.aim_x = this.x;
        this.aim_y = this.y;
        this.using_aim = false;
        this.sprite.angle = FIX_ANGLE;
    }
    move(){
        /* D-Pad && Left Stick | right and left */
        if(pad.GetPad(Pads.RIGHT))       this.h_speed = 1.0;
        else if(pad.GetPad(Pads.LEFT))   this.h_speed = -1.0;
        else if(pad.GetLeftJoyX() > 7)   this.h_speed = (pad.GetLeftJoyX() - 28)/100;
        else if(pad.GetLeftJoyX() < -7)  this.h_speed = (pad.GetLeftJoyX() + 27)/100;
        else this.h_speed = 0;
        /* D-Pad && Left Stick | up and down */
        if(pad.GetPad(Pads.UP))          this.v_speed = -1.0;
        else if(pad.GetPad(Pads.DOWN))   this.v_speed = 1.0;
        else if(pad.GetLeftJoyY() > 7)   this.v_speed = (pad.GetLeftJoyY() - 28)/100; 
        else if(pad.GetLeftJoyY() < -7)  this.v_speed = (pad.GetLeftJoyY() + 27)/100;
        else this.v_speed = 0;
        /* Move player */
        if(this.h_speed != 0 || this.v_speed != 0){
            /* Limite vertical move */ 
            if(this.h_speed != 0 && this.v_speed != 0) this.limiter = 0.75;
            else this.limiter = 1.0;
            /* Apply values */
            this.x += this.h_speed * this.current_speed * this.limiter;
            this.y += this.v_speed * this.current_speed * this.limiter;
            if(this.current_speed < this.speed) this.current_speed += 0.25;
        }
        if(this.h_speed == 0 && this.v_speed == 0) this.current_speed = 0;
        /* retrive side without aim */
        if(!this.using_aim){
            if(this.h_speed > 0) this.facing = RIGHT;
            else if(this.h_speed < 0) this.facing = LEFT;
        }
        /* rotate player sprite */
        if(this.h_speed > 0){
            if(this.sprite.angle <= 0.5) this.sprite.angle += 0.05;
        } else if(this.h_speed < 0){
            if(this.sprite.angle >= -0.5) this.sprite.angle -= 0.05;
        } else if(this.v_speed > 0){
            if(this.sprite.angle <= 0.3) this.sprite.angle += 0.05;
        } else if(this.v_speed < 0){
            if(this.sprite.angle >= -0.3) this.sprite.angle -= 0.05;
        } else { 
            this.sprite.angle = 0.01;
            /* this cause a bug */
            //if(this.sprite.angle > 0) this.sprite.angle -= 0.05;
            //else if(this.sprite.angle < 0) this.sprite.angle += 0.05;
        }
    }
    updateSide(){
        let sidetoflip;
        if(this.facing == RIGHT && !sprt.facingRight(this)){
            sidetoflip = RIGHT;
            sprt.flip(this, sidetoflip);
            if(this.using_weap){
                this.weap.off_x *= -1;
                sprt.flip(this.weap, sidetoflip);
            }
        } else if(this.facing == LEFT && sprt.facingRight(this)){
            sidetoflip = LEFT;
            sprt.flip(this, sidetoflip);
            if(this.using_weap){
                this.weap.off_x *= -1;
                sprt.flip(this.weap, sidetoflip);
            }
        }
    }
    /* gambiarra */
    aim(){
        if(pad.GetRightJoyX() != 0 || pad.GetRightJoyY() != 0){
            this.using_aim = true;
            this.time = 0;
            this.oldtime = Timer.getTime(timer);
        } else if(pad.GetRightJoyX() == 0 && pad.GetRightJoyY() == 0 && this.using_aim){
            this.time += Timer.getTime(timer) - this.oldtime;
            if(this.time > AIM_TIME_LIMITE){
                this.using_aim = false;
                this.aim_angle = FIX_ANGLE;
            }    
        }
        if(this.using_aim){
            this.aux_x += pad.GetRightJoyX()/100 * this.aim_speed;
            this.aux_y += pad.GetRightJoyY()/100 * this.aim_speed;
            this.aim_x = this.x + this.aux_x;
            this.aim_y = this.y + this.aux_y;
            /* rotate weap */
            this.aim_angle = math.Atan2(this.aim_y - this.y, this.aim_x - this.x);
            if(this.facing == RIGHT){
                this.aim_angle += 0.15; 
            } else{
                this.aim_angle += 9.5;
            }
        } else{
            if(this.facing == RIGHT) this.aim_x = this.cx + 50.0;
            else this.aim_x = this.cx - 50.0
            this.aim_y = this.cy;
        }
        /* retrive side using aim*/
        if(this.using_aim){
            if(this.aim_x - this.x > 0) this.facing = RIGHT;
            else if(this.aim_x - this.x < 0) this.facing = LEFT;
        }
    }
    draw(){
        /* center positions */
        this.cx = Center(this.x, this.size);
        this.cy = Center(this.y, this.size);
        /* draw player */
        draw.img(this.sprite, this.cx, this.cy);
        /* Draw aim*/
        if(this.using_aim) draw.circle(this.aim_x, this.aim_y, this.aim_size, ORANGE);
        /* Draw weap | need to improve */
        if(this.using_weap) this.weap.drawWithPos(this.cx, this.cy, this.aim_angle);
    }
    debug(){
        df.print(16, 6*4,  "x: " + this.x + " y: " + this.y);
        df.print(16, 6*6,  "h_speed: " + this.h_speed + " v_speed: " + this.v_speed);
        df.print(16, 6*8,  "size: " + this.size);
        df.print(16, 6*10, "current_speed: " + this.current_speed);
        df.print(16, 6*12, "speed: " + this.speed + " health: " + this.health + " defense: " + this.defense);
        df.print(16, 6*14, "teste: " + this.speed);
        df.print(16, 6*16, "using aim: " + this.using_aim);
        df.print(16, 6*18, "using weap: " + this.using_weap);
        df.print(16, 6*20, "time: " + this.time);
    }
    process(){
        this.move();
        this.aim();
        this.draw();
        this.updateSide();
        //this.debug();
        if(this.using_weap) { this.weap.process(); }
    }
};
class Camera {
    x = 0;
    y = 0;
    target = null;
    constructor(x, y){
        x === undefined ? this.x += 0 : this.x = x;
        y === undefined ? this.y += 0 : this.y = y;
    }
    process(){
        this.x += this.target.h_speed * this.target.current_speed * this.target.limiter;
        this.y += this.target.v_speed * this.target.current_speed * this.target.limiter;
    }
    attachTarget(target){
        this.target = target;
    }
}

/* -------------------- 
       GLOBAL VARS       
   -------------------- */

let choice = 0;

/* -------------------- 
      MENU FUNC VARS       
   -------------------- */

let menuTexts = [
    {
        string:"Jogar",
        x:CENTER_W-(f.getTextSize("Jogar").width/2),
        y:CENTER_H-(f.getTextSize("Jogar").height/2)+120,
    },
    {
        string:"Configurar",
        x:CENTER_W-(f.getTextSize("Configurar").width/2),
        y:CENTER_H-(f.getTextSize("Configurar").height/2)+120,
    },
    {
        string:"Sair",
        x:CENTER_W-(f.getTextSize("Sair").width/2),
        y:CENTER_H-(f.getTextSize("Sair").height/2)+120,
    },
    {
        string:"Spacial Shooter",
        x:CENTER_W-(f.getTextSize("Spacial Shooter").width/2),
        y:CENTER_H-(f.getTextSize("Spacial Shooter").height/2)-120,
    },
];

/* -------------------- 
      CONFIG FUNC VARS       
   -------------------- */

let configTexts = [
    {
        string:"Configurar",
        x:CENTER_W-(f.getTextSize("Configurar").width/2),
        y:CENTER_H-(f.getTextSize("Configurar").height/2)-120,
    }
];

/* -------------------- 
      GAME FUNC VARS       
   -------------------- */

const player      = new Player(0, 0);
const player_weap = new Weapon(0, 0, 25);
const cam         = new Camera(-CENTER_W, -CENTER_H);

attachWeapon(player_weap, player);
cam.attachTarget(player);
draw.setCam(cam);

let timer = Timer.new();
Timer.setTime(timer, 0);
Timer.resume(timer);

/* -------------------- 
       GAME FUNC     
   -------------------- */

const menu = () => {
    Screen.clear(DARK_BLUE);

    pad.UpdatePad();
    GetResetSys();

    if(pad.GetPadDown(Pads.RIGHT)) choice += 1;
    if(pad.GetPadDown(Pads.LEFT)) choice -= 1;
    if(choice > 2) { choice = 0;
    } else if(choice < 0) { choice = 2;}

    f.print(menuTexts[3].x, menuTexts[3].y, menuTexts[3].string);
    f.print(menuTexts[choice].x, menuTexts[choice].y, menuTexts[choice].string);
    
    if(pad.GetPadDown(Pads.CROSS)){
        if(choice == 0) {
            currentFunc = FUNC_GAME;
        } else if(choice == 1){
            currentFunc = FUNC_CONFIG;
        } else if(choice == 2){
            System.exitToBrowser();
        }
    }

    // Debug stuff
    debugXY();

    Screen.flip();
};
const config = () => {
    Screen.clear(DARK_BLUE);

    pad.UpdatePad();
    GetResetSys();

    if(pad.GetPadDown(Pads.TRIANGLE)) currentFunc = FUNC_MENU;

    f.print(configTexts[0].x, configTexts[0].y, configTexts[0].string);

    Screen.flip();
};
const game = () => {
    Screen.clear(DARK_BLUE);

    pad.UpdatePad();

    GetResetSys();

    if(pad.GetPadDown(Pads.START)) currentFunc = FUNC_MENU;
    if(pad.GetPadDown(Pads.CIRCLE) && player.using_weap) player.weap.shoot(player.cx + player.weap.off_x, 
        player.cy + player.weap.off_y, player.aim_x, player.aim_y);

    player.process();
    //enemy1.process();
    cam.process();
    
    draw.rect(Center(0, 24), Center(-64, 24), 24, 24, WHITE);

    df.print(20, 240, "Global Timer: " + Timer.getTime(timer));

    Screen.flip();
};

/* -------------------- 
   GAME FUNC CONTROLLER     
   -------------------- */

const FUNC_MENU   = 0;
const FUNC_CONFIG = 1;
const FUNC_GAME   = 2;
let currentFunc = FUNC_GAME;
let funcTable = [menu, config, game];
os.setInterval(() => { funcTable[currentFunc]() } , 0);

/* -------------------- 
       DEBUG THINGS    
   -------------------- */
let df = new Font();
df.scale = 0.3f;
df.color = WHITE;
let dx = 0;
let dy = 0;
function debugXY(){
    if(pad.GetPad(Pads.UP))    dy -= 1;
    if(pad.GetPad(Pads.RIGHT)) dx += 1;
    if(pad.GetPad(Pads.DOWN))  dy += 1;
    if(pad.GetPad(Pads.LEFT))  dx -= 1;
    df.print(16, 8, "x: " + dx + " y: " + dy);
}

/* Spacial Shooter /*
// TODO programming

/* Gameplay */
// Player Move and Aim 
// Weapon
// Camera behavior
// Player Attributes
// Enemys
// Waves behaviors

/* Menu */
// Game Title and Texts (includes players score)
// Player simple customize

/* Configs */
// Change resolution
// Change language

// TODO assets