/**
 * Using Point class
 * @see http://jsdo.it/akm2/fhMC
 */
 
/**
 * click: Add Boid.
 * keyboard 'g': Remove Pink Boid.
 * keyboard 'p': We are the world.
 * keyboard 'd': Show debug maker.
 */
 
var FPS = 60;
var maxSpeed = 1;
var fidelity = 5;
var STATIC_SPEED = maxSpeed * 0.25;

var history1length = 100;   // length of arraylist for storing history of 1st order primitive data
                            // such as position, velocity, rotation,

var L2bracket = 5; // how much of level 1 data we trunicate to level 2 data
                   // take 5 of level 1 reference into level 2
var L2div = history1length / L2bracket; // how many times can we break lv1 to lv2

var L1ms = 50; // lv1 delay

var L2ms = 100; //lv2 analysis delay

var L3ms = 3000;

var boidTypes;
var boids = [];
var boidcount = 0;
// var bloodstains = [];
var mousePoint = new Point();
var clickCount = 0;
var isPeace = false;
var pushed = false;

// var t1 = Date.now();
// var t2 = Date.now();
// var t3 = Date.now();

var l1count = 0;
var l2count = 0;
var l3count = 0;

// Alias
var random = Math.random;



var canvas;
var brushCanvas;
var pictureCanvas;
var context;
var brushContext;
var pictureContext;
var canvasWidth = 1280;
var canvasHeight = 800;
var shapes = [];
var urlCount = false;
var imgURL = "";
var img;    
var hex = "";
// var clickCount = 0;
// var bbpff = new Audio('sfx/bbpff.mp3');
// var tick = new Audio('sfx/tick.mp3');
// var tiss = new Audio('sfx/tiss.mp3');

function init() {
    //initialize Canvas Element 1 'canvas'
    canvas = document.getElementById('c'),
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');
    context.lineCap = 'round';

    //initialize Canvas Element 2 'brushCanvas'
    brushCanvas = document.getElementById('bc'),
    brushCanvas.width  = canvasWidth;
    brushCanvas.height = canvasHeight;
    brushContext = brushCanvas.getContext('2d');

    //initialize Canvas Element 2 'pictureCanvas'
    pictureCanvas = document.getElementById('pc'),
    pictureCanvas.width  = canvasWidth;
    pictureCanvas.height = canvasHeight;
    pictureContext = pictureCanvas.getContext('2d');
    img = new Image();
    img.crossOrigin = true;
    // img.src =
    //             'http://www.corsproxy.com/' +
    //             imgURL.substr(imgURL.indexOf('//') + 2);
    // img.src ='img/color_palette.png';
    img.src ='img/young.jpg';

    img.onload = function() {
        pictureContext.drawImage(img, 0, 0);
    };

    // canvas.addEventListener('click', click, false);
    // setInterval(loop, 1000 / FPS);

    // canvas = document.getElementById('c');
    // context = canvas.getContext('2d');
    
    window.addEventListener('resize', resize, false);
    resize();
    
    // Boid の種類を設定
    // BoidType('Boid の識別名', '獲物の識別名', '天敵の識別名', '色')
    // 獲物と天敵を複数指定の場合は配列で指定
    boidTypes = [
        new BoidType('a', 'b', ['c', 'd'], 'rgba(250, 185, 15, 1)'), // Orange
        new BoidType('b', 'c', ['a', 'd'], 'rgba(165, 240, 20, 1)'), // Green
        new BoidType('c', 'a', ['b', 'd'], 'rgba(20, 135, 240, 1)'), // Blue
        new BoidType('d', ['a', 'c', 'b'], false, 'rgba(255, 0, 255, 1)') // Pink
    ];
    
    var dt = Date.now();
    for (var i = 0; i < 30; i++) {
        createBoid(random() * innerWidth, random() * innerHeight, boidTypes[Math.floor(i / 10)]);
    }
    
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mouseout', mouseOut, false);
    document.addEventListener('click', click, false);
    document.addEventListener('keydown', keyDown, false);
    
    setInterval(loop, 1000 / FPS);
}

// function loadImage() {
//     if (!urlCount) {
//         imgURL = window.prompt("Please enter an image URL.\n(1280x800 for optimal results)\nInclude the image's FULL path.\nCurrently links are not verified.\nEnsure image is Cross Origin Resource Approved\nOr try this: \"http://fc06.deviantart.net/fs43/f/2009/065/5/9/summer_beach_by_magann.jpg\"");
//         if (imgURL === "" || imgURL == null) {
//             loadImage();
//         } else {
//             urlCount = true;
//         }
//     }
// }

function numberOfSides(x) {
    var sides = x;
    switch (sides) {
        case 0:
            sides = 3;
            break;
        case 1:
            sides = 4;
            break;
        case 2:
            sides = 5;
            break;
        case 3:
            sides = 6;
            break;
        case 4:
            sides = 7;
            break;
        case 5:
            sides = 8;
            break;
    }
    return sides;
};

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}
 
function createShape(x, y, w, h, s) {
    var shape = new drawShape(x, y, w, h, s);
    shapes.push(shape);
    if (shapes.length > 40) {
        shapes.shift();
    }
    return shape;
}

function click (e) {
    // var mouseX = e.pageX;
    // var mouseY = e.pageY;
    // createShape(mouseX, mouseY, fidelity, fidelity, numberOfSides());

        // クリックごとに Boid の種類を切り替える
    // まれにピンクボイド (インデックス 3) を出現させる, ピンクは出現数を 1 に
    var typeIndex = clickCount % (3 + Math.floor(Math.random() * 0.9 + 0.2));
    var n = typeIndex === 3 ? 1 : 1;
    //var typeIndex = clickCount % boidTypes.length;
    //var n = boidTypes.length;
    
    for (var i = 0; i < n; i++) {
        createBoid(e.clientX, e.clientY, boidTypes[typeIndex]);
    }
    clickCount++;
}

function drawShape(x, y, w, h, s) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = "";
    this.s = s;
    this.cc = clickCount;

    this.isCleanUp = false;
    this._alpha = 1;
    this._targetAlpha = 0.1;
    this._time = new Date().getTime();

    this.setx = function(ix){
        ix = this.x;
    }

    var imgData = pictureContext.getImageData(this.x, this.y, 1, 1);
    var red = imgData.data[0];
    var green = imgData.data[1];
    var blue = imgData.data[2];

    hex = "#" + rgbToHex(red, green, blue);

    this.c = hex;
}

drawShape.prototype = {

    update: function() {
        //this.x+= maxSpeed;
        this.setx(this.x);

        // this._alpha += (this._targetAlpha - this._alpha) * 0.1;
        
        // if (this._targetAlpha === 0) {
        //     if (Math.abs(this._targetAlpha - this._alpha) < 0.001) {
        //         this.isCleanUp = true;
        //     }
        // } else if (new Date().getTime() - this._time > 600) {
        //     this._targetAlpha = 0;
        // }
    },

    draw: function(ctx) {
        var x = this.x;
        var y = this.y;
        var sides = this.s;

        size = this.w,
        Xcenter = x,
        Ycenter = y;

        ctx.beginPath();
        ctx.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

        for (var i = 1; i <= sides;i += 1) {
            ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / sides), Ycenter + size * Math.sin(i * 2 * Math.PI / sides));
        }

        ctx.save();
        ctx.fillStyle = this.c;
        // ctx.fillRect(x, y, size, size);
        ctx.fill();
        ctx.restore();

        // ctx.save();
        // ctx.globalAlpha = this._alpha;
        // ctx.strokeStyle = "rgba(255,255,255,"+this._alpha+")";
        // ctx.lineWidth = 1;
        // ctx.stroke();
        // ctx.restore();

        // if (sides == 3 && clickCount == this.cc) {
        //     bbpff.play();
        //     clickCount++;
        // } else if (sides == 4 && clickCount == this.cc) {
        //     tick.play();
        //     clickCount++;
        // } else if (clickCount == this.cc) {
        //     tiss.play();
        //     clickCount++;
        // }
    }
}

function loop(){
    // Debug
    // if (Debug.loopStop()) return;

    var i;
    var len;
    
    for (i = 0, len = shapes.length; i < len; i++) {
        var shape = shapes[i];
        shape.draw(brushContext);
        shape.update(shapes);
    }
    
    context.save();
    context.fillStyle = 'rgb(34, 34, 34)';
    context.fillRect(0, 0, innerWidth, innerHeight); 
    context.restore();

    
    // for (i = 0, len = bloodstains.length; i < len; i++) {
    //     var bloodstain = bloodstains[i];
    //     bloodstain.draw(context);
    //     bloodstain.update(); 
        
    //     if (bloodstain.isCleanUp) {
    //         bloodstains.splice(i, 1);
    //         len--;
    //         i--;
    //     }
    // }
    
    for (i = 0, len = boids.length; i < len; i++) {
        var boid = boids[i];
        boid.draw(context);
        boid.update(boids);
        boid.analyze();

        // if (boid.isDead) {
        //     bloodstains.push(boid.createBloodstain());
        //     boids.splice(i, 1);
        //     len--;
        //     i--;
        // }
    }

    // context.save();
    // context.fillStyle = 'rgb(0, 0, 0)';
    // context.fillRect(0, 0, canvasWidth, canvasHeight);
    // context.restore();
}

var ControlPanel = function() {
  this.maxSpeed = maxSpeed;
  this.fidelity = fidelity;
};

var controls = function() {
        var values = new ControlPanel();
        var gui = new dat.GUI();

        var speedController = gui.add(values, 'maxSpeed', 0, 5).step(0.25);
        var fidelityController = gui.add(values, 'fidelity', 5, 30).step(1);

        speedController.onFinishChange(function(value) {
            maxSpeed = value;
        });

        fidelityController.onFinishChange(function(value) {
            fidelity = value;
        });
    };

window.onload = function() {
    // loadImage();
    init();
    controls();
};


// メインスクリプトここまで

//-----------------------------------------
// DEBUG
//-----------------------------------------

var Debug = {
    enabled: false,
    _loopStop: false,
    
    /**
     * Boid (boid) から対象 (target) に囲みとふたつを結ぶラインをひく
     * 
     * @param boid
     * @param target
     * @param distance 対象までの距離
     * @param targetPoint
     *  targetPoint はラインの目標値となるので対象が反対側で座標が対象の実際のものと異なる場合はその座標を x, y で持つオブジェクトを指定する
     *  省略した場合は target の値が使用される
     */
    mark: function(boid, target, distance, targetPoint) {
        // デバッグモードでない場合は抜ける, d キーで有効化
        if (!this.enabled) return;
        
        if (targetPoint == null) {
            targetPoint = target;
        }
        
        var tx = target.x;
        var ty = target.y;
        var x = boid.x;
        var y = boid.y;

        context.save();
        context.lineWidth = 0.5;
        // target circle
        context.strokeStyle = '#FF0000';
        context.beginPath();
        context.arc(tx, ty, 15, 0, Math.PI * 2, false);
        context.stroke();
        // self circle
        context.strokeStyle = '#CCCCCC';
        context.beginPath();
        context.arc(x, y, 15, 0, Math.PI * 2, false);
        context.stroke();
        // line
        var radian = Math.atan2(targetPoint.y - y, targetPoint.x - x);
        var dx = distance * Math.cos(radian);
        var dy = distance * Math.sin(radian);
        context.strokeStyle = '#FF0000';
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + dx, y + dy);
        context.stroke();
        if (target !== targetPoint) {
            // target と targetPoint が違うインスタンス (反対側の座標オブジェクト) の場合
            context.beginPath();
            context.moveTo(tx, ty);
            context.lineTo(tx - dx, ty - dy);
            context.stroke();
        }
        context.restore();
    },
    
    loopStop: function(stop) {
        if (typeof stop !== 'undefined') {
            this._loopStop = stop;
        }
        return !this.enabled ? false : this._loopStop;
    },
    
    logLimit: function(n) {
        if (window.logLimit) {
            window.logLimit(n);
        }
    }
};

Debug.enabled = false;
Debug.logLimit(1000);


////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
///////// BREAK IN FILES ///////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

function resize() {
    canvas.width = canvasWidth = window.innerWidth;
    canvas.height = canvasHeight = window.innerHeight;
}

function mouseMove(e) {
    mousePoint.x = e.clientX;
    mousePoint.y = e.clientY;
}

function mouseOut(e) {
    mousePoint.x = mousePoint.y = -9999;
}

function keyDown(e) {
    if (e.keyCode === 71) { // g key
        var boid;
        for (var i = 0, len = boids.length; i < len; i++) {
            boid = boids[i];
            if (boid.type.name === 'd') {
                // bloodstains.push(boid.createBloodstain());
                boids.splice(i, 1);
                len--;
                i--;
            }
        }
    }
    if (e.keyCode === 72 && pushed === false) {
        document.getElementById("c").style.visibility = "hidden";
        pushed = true;
    } else if (e.keyCode === 72 && pushed === true) {
        document.getElementById("c").style.visibility = "visible";
        pushed = false;
    }
    
    if (e.keyCode === 80) { // p key
        isPeace = !isPeace;
    }
    
    // Debug mode toggle
    if (e.keyCode === 68) { // d key
        Debug.enabled = !Debug.enabled;
    }
}

function createBoid(x, y, type) {
    var boid = new Boid(x, y, type, random() * 0.6 - 0.3, random() * 0.6 - 0.3, boidcount);
    boidcount++;
    //console.log(boidcount);
    boids.push(boid);
    return boid;
}


/**
 * Boid
 */
function Boid(x, y, type, vx, vy ,bid) {
    //bid is boid ID number
    this.bid = bid;

    this.x = x || 0;
    this.y = y || 0;
    this.type = type;
    this.v = new BoidVelocity(this, vx, vy);
    this.isDead = false;
    this._time = new Date().getTime();

    this.t1 = Date.now();
    this.t2 = Date.now();
    this.t3 = Date.now();

    var phxa = [];  //position history x array
    var phya = [];
    var vhxa = []; //velocity history array of velocity x
    var vhya = [];
    // "dumb" 8 way angle is determined by low resolution
    var ahx = []; //angle history horizontal (essentially right or left)
    var ahy = []; //essentially up or down

    var ahc = []; //angle history in clock-wise
                  //1 North, 2 East, 3 South, 4 West, 0 = static

    var chx = 0;  //current heading x-axis, -1,0,1
    var chy = 0;  //current heading y-axis, 
    var majh = 0; //

    //var L1 = [4][];
    var L1 = new Array(4);
    for (var i = 0; i < L1.length; i++) {
        L1[i]=new Array();
    }



    var testA2 = [];
    var testA3 = [];

    this.ibeen = 0;
    // from combination of these 2, we can compare and approximate rough angle without using trigonometry

    // this.addhistory = function(px,py,vhx,vhy){
    this.addhistory = function(){

        var v = this.v;
        var vhx = v.x;
        var vhy = v.y;

        if(L1[0].length >= 100){
            // for (var i = L1; i >= 0; i--) {
            //     L1[i].shift();
            // };
            L1[0].shift();
            L1[1].shift();
            L1[2].shift();
            L1[3].shift();
            ahc.shift();
        }

        L1[0].push(this.x);
        L1[1].push(this.y);
        L1[2].push(vhx);
        L1[3].push(vhy);
        // phxa.push(px);
        // phya.push(py);
        // vhxa.push(vhx);
        // vhya.push(vhy);

        if(vhx>STATIC_SPEED||vhy>STATIC_SPEED){  //
            if(Math.abs(vhx)>Math.abs(vhy)){// moving more in horizontal than vertical
                if(vhx > STATIC_SPEED){  // heading +x
                    ahc.push(2); //East
                }else if(vhx < -STATIC_SPEED){ 
                    ahc.push(4);
                }else{
                    ahc.push(6); // just to end if statement. This should never happen.
                }
            }else{
                if(vhy > STATIC_SPEED){  // heading +x
                    ahc.push(1); //North
                }else if(vhy < -STATIC_SPEED){ 
                    ahc.push(3);
                }else{
                    ahc.push(5); // just to end if statement. This should never happen.
                }
            }
        }else{
            ahc.push(0);
        }

        
        this.t1 = Date.now();

        //console.log('history added to boid ID'+bid+' length of history length is now '+phxa.length+' value was '+px);
        //console.log('history added to boid ID'+bid+' length of history velocity is now '+vhxa.length+' value was '+vhx);
        //console.log('history added to boid ID'+bid+' length of history angle is now '+ahx.length+' value was '+ahx[ahx.length-1]);
        //console.log('history added to boid ID'+bid+' length of history angle is now '+ahc.length+' value was '+ahc[ahc.length-1]);
        //console.log(bid+'ID '+this._dv.x+','+ this.v.x);
    }

    this.applyL2 = function(){

        //L2div is how many average can be extracted.  history/bracket
        //e.g. 20  because 100/5

        for (var i = 0; i < L2div; i++) {

            var mva = 0;  //holder for ave
            for (var j = 0; j < L2bracket; j++) {
                mva+= L1[0][i*L2bracket+j];

            }

            if (mva>L2bracket) {  
                mva = mva/L2bracket | 0;
            }else{   //if less than 5, don't bother dividing
                mva =0;
            }
            
            testA2.push(mva);

        }

        if(testA2.length >= 60){  //chop excess
            for (var i = 0; i < L2div; i++) {
                testA2.shift();
            }
        }
        this.t2 = Date.now();

    }

    this.applyL3 = function(){

        var qhor   = window.innerWidth  /2 | 0;
        var qvert =  window.innerHeight /2 | 0;

        var regions = [0,0,0,0];


        for (var i = 0; i < testA2.length; i++) {
            if(testA2[i]<qvert){
                if(testA2[i]<qhor) {regions[0]++;}
                else{
                    regions[1]++;
                }
                
            }else{
                if(testA2[i]<qhor) {regions[2]++;}
                else{
                    regions[3]++;
                }
                
            }

        }
        //console.log(testA2.toString());
        //simple math max, array position
        this.ibeen = 1+regions.indexOf(Math.max.apply(Math, regions));
        //this.ibeen = Math.max.apply(Math, regions);
        //console.log(regions[0]+'  '+regions[1]+'  '+regions[2]+'  '+regions[3]+'  '+'END  '+this.ibeen+'  END');
        // console.log(regions[0]+'  '+regions[1]+'  '+regions[2]+'  '+regions[3]+'  '+'END'+regions.indexOf(Math.max.apply(Math, regions))+'END');
        this.t3 = Date.now();
    }

    this.getvhxa = function(){
        return vhxa;
    }


    this.histLength = function(){
        return vhxa.length;
    }
    
    this.getid = function(){
        return id;
    }

    this.getibeen = function(){
        return this.ibeen;
    }

    this.gettype = function(){
        return type;
    }


    // コスト削減の使い回し
    this._op = {}; // 画面端を超えた Boid の距離計算用
    this._dv = this.v.clone(); // ベクトル描画用



}

Boid.prototype = {
    
    update: function(targets) {
        if (this.isDead) return;
        
        var len = targets.length;
        var v = this.v;
        var type = this.type;
        var overPoint = this._op;

        for (var i = 0; i < len; i++) {
            var target = targets[i];

            if (target === this) continue;
            
            var distance = Point.distance(this, target);
            var overDist = Infinity;
            
            // 画面端を超えた Boid の距離計算  
            // 超過があれば超過分の距離を算出
            //Calculating edge bleed.

            var left = 80;
            var right = canvasWidth - left;
            var top = left;
            var bottom = canvasHeight - top;
            
            overPoint.x = target.x;
            overPoint.y = target.y;
            if (this.x < left && target.x > right) {
                overPoint.x -= canvasWidth;
            } else if (this.x > right && target.x < left) {
                overPoint.x += canvasWidth;
            }
            if (this.y < top && target.y > bottom) {
                overPoint.y -= canvasHeight;
            } else if (this.y > bottom && target.y < top) {
                overPoint.y += canvasHeight;
            }
            if (overPoint.x !== target.x || overPoint.y !== target.y) {
                overDist = Point.distance(this, overPoint);
            }
            
            var isOver = false;
            if (type.isFamily(target.type) || isPeace) {
                // Is family
                
                if (distance < 25 || (isOver = overDist < 25)) {
                    v.separation(isOver ? overPoint : target, isOver ? overDist : distance);
                    //Debug.mark(this, target, isOver ? overDist : distance, isOver ? overPoint : null);

                } else if (distance < 35 || overDist < 35) {
                    v.alingment(target.v);
                    //Debug.mark(this, target, isOver ? overDist : distance, isOver ? overPoint : null);

                } else if (distance < 100 || (isOver = overDist < 100)) {
                    v.cohesion(isOver ? overPoint : target);
                    //Debug.mark(this, target, isOver ? overDist : distance, isOver ? overPoint : null);
                }

            } else if (distance < 120 || (isOver = overDist < 120)) {
                if (type.isTarget(target.type)) {
                    // Is target
                    
                    v.cohesion(isOver ? overPoint : target, 2);
                    Debug.mark(this, target, isOver ? overDist : distance, isOver ? overPoint : null);

                } else if (type.isEnemy(target.type)) {
                    // Is enemy
                    
                    // 追いつかれたら死亡, 出現から1秒は無敵
                    if (new Date().getTime() - this._time > 1000 && (distance < 10 || overDist < 10)) {
                        this.isDead = true;
                        return;
                    }
                    
                    if (distance < 100 || (isOver = overDist < 100)) {
                        v.separation(isOver ? overPoint : target, isOver ? overDist : distance, 3);
                        //Debug.mark(this, target, isOver ? overDist : distance, isOver ? overPoint : null);
                    }
                }
            }
        }
        
        // マウスを避ける
        var mouseDist = Point.distance(this, mousePoint);
        if (mouseDist < 80) {
            v.separation(mousePoint, mouseDist, 5);
        }

        v.applyVelocity();
        this.x += v.x;
        this.y += v.y;

        

        // 反対側に出現
        //Appear on opposite side after overflow of screen
        if (this.x < 0) {
            this.x += canvasWidth;
        } else if (this.x > canvasWidth) {
            this.x -= canvasWidth;
        }
        if (this.y < 0) {
            this.y += canvasHeight;
        } else if (this.y > canvasHeight) {
            this.y -= canvasHeight;
        }
    },
    
    // createBloodstain: function() {
    //     return new Bloodstain(this.x, this.y, this.type.color);
    // },

    analyze: function() {

          if (Date.now() - this.t1 > L1ms){
            this.addhistory();
            l1count++;
            // this.addhistory(this.x,this.y,v.x,v.y);
            //console.log(Date.now() -t1);
         }

        if (Date.now() - this.t2 > L2ms){
            createShape(this.x, this.y, fidelity, fidelity, numberOfSides(1));
            this.applyL2();
            l2count++;
            //console.log('L2 analysis should happen');
            //console.log((Date.now()-t1)+' T2 '+(Date.now() -t2)+' T3 '+(Date.now() -t3));
          
        }

        if (Date.now() - this.t3 > L3ms){
            
            this.applyL3();
            l3count++;
            // console.log('L3 ANALYSIS  : boid length is '+boids.length+' last bid is '+boids[boids.length-1].bid);
            //console.log('TYPE '+this.type);
            // console.log('BID '+this.bid);
            // console.log('executed L1 = '+l1count+' executed L2 = '+l2count+' executed L3 = '+l3count+'')
            

        }

    },
    
    draw: function(ctx) {
        var x = this.x;
        var y = this.y;
        var v = this.v;
        var color = this.type.color;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2, false);
        ctx.fill();
        
        // ベクトルの描画
        var dv = this._dv;
        dv.x = v.x;
        dv.y = v.y;
        dv.normalize(20 * v.length() / maxSpeed);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dv.x, y + dv.y);
        ctx.stroke();

        //this.addhistory(x,y,dv.x,dv.y);

        if(this.histLength %200){
            
        }
        //console.log(this.getid+'has history of '+this.histLength);
    }
};


/**
 * Boid の速度を管理するオブジェクト
 * みっつのルールから速度を蓄積し applyVelocity で速度を適用する
 * 
 * @param targetBoid 担当する Boid インスタンス
 * @param x
 * @param y
 * @super Point
 * @see http://jsdo.it/akm2/fhMC
 */
function BoidVelocity(targetBoid, x, y) {
    this.target = targetBoid;
    this.x = x || 0;
    this.y = y || 0;
    this.dispose();
}

BoidVelocity.prototype = extend({}, Point.prototype, {
    
    separation: function(point, distance, scale) {
        if (typeof scale === 'undefined') scale = 1;
        
        var p = distance < 1 ? 1 : 1 / distance;
        this.sx -= (point.x - this.target.x) * p * scale;
        this.sy -= (point.y - this.target.y) * p * scale;
        this.sc++;
    },
    
    alingment: function(velocity) {
        this.ax += velocity.x;
        this.ay += velocity.y;
        this.ac++;
    },
    
    cohesion: function(point) {
        this.cx += point.x;
        this.cy += point.y;
        this.cc++;
    },
    
    /**
     * 速度を自身に適用する, 実行後はルールによって蓄積した速度を破棄
     */
    applyVelocity: function() {
        if (this.sc) {
            this.x += this.sx / this.sc;
            this.y += this.sy / this.sc;
        }
        if (this.ac) {
            this.x += (this.ax / this.ac - this.x) * 0.125;
            this.y += (this.ay / this.ac - this.y) * 0.125;
        }
        if (this.cc) {
            this.x += (this.cx / this.cc - this.target.x) * 0.005;
            this.y += (this.cy / this.cc - this.target.y) * 0.005;
        }
        
        if (this.length() > maxSpeed) {
            this.normalize(maxSpeed);
        }
        
        this.dispose();
    },

    
    dispose: function() {
        this.sx = this.sy = this.sc = 0;
        this.ax = this.ay = this.ac = 0;
        this.cx = this.cy = this.cc = 0;
    }

});


/**
 * Boid の種類を管理するオブジェクト
 * 
 * @param name Boid の識別名
 * @param target 追跡する Boid の識別名, 文字列かそれらを格納した配列
 * @param enemy 避ける Boid の識別名, 文字列かそれらを格納した配列
 * @param color
 */
function BoidType(name, target, enemy, color) {
    this.name = name;
    this.target = target;
    this.enemy = enemy;
    this.color = color;
}

BoidType.prototype = {

    isFamily: function(name) { return this._is('name', name); },
    isTarget: function(name) { return this._is('target', name); },
    isEnemy: function(name) { return this._is('enemy', name); },
    
    _is: function(key, name) {
        if (name instanceof BoidType) {
            name = name.name;
        }
        
        if (this[key] instanceof Array) {
            for (var i = 0, len = this[key].length; i < len; i++) {
                if (this[key][i] === name) {
                    return true;
                }
            }
            
            return false;
        }
        
        return this[key] === name;
    }
};


/**
 * Bloodstain
 */
// function Bloodstain(x, y, color) {
//     this.x = x || 0;
//     this.y = y || 0;
//     this.color = color;
//     this.isCleanUp = false;
//     this._radius = Math.random() * 5 + 15;
//     this._alpha = 1;
//     this._targetAlpha = 0.1;
//     this._time = new Date().getTime();
// }

// Bloodstain.prototype = {
    
//     update: function() {
//         this._alpha += (this._targetAlpha - this._alpha) * 0.015;
        
//         if (this._targetAlpha === 0) {
//             if (Math.abs(this._targetAlpha - this._alpha) < 0.001) {
//                 this.isCleanUp = true;
//             }
//         } else if (new Date().getTime() - this._time > 20000) {
//             this._targetAlpha = 0;
//         }
//     },
    
//     draw: function(ctx) {
//         ctx.save();
//         ctx.fillStyle = this.color;
//         ctx.globalAlpha = this._alpha;
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this._radius, 0, Math.PI * 2, false);
//         ctx.fill();
//         ctx.restore();
//     }
// };


