/* DM3014 Interactive Devices, Snehaja 2026
 * Week 5 - Computer Vision
 * Project Name: "FIREEE". The webcam draws the fire emoji based on the detected movement. 
 The fire emoji also changes its tint to red as it starts to fade away when motion is not detected anymore (there are 2 states, active and inactive)  
 Claude code was used to colourise the emoji, using the tint() function. 
 */


// store the webcam and images used for motion detection
var camera;
var prevImg;
var currImg;
var diffImg;
var spotImg;
var threshold = 0.1; // *** change sensitivity (decimal between 0 - 1)
var grid;
let img;


// loading the emoji image
function preload() {
   img1 = loadImage("emoji.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

    // Capture webcam video and flip it horizontally
  camera = createCapture(VIDEO, { flipped: true });
  camera.hide();

  grid = new Grid(1280, 720);
}

function draw() {
  background(120);
  // Display the live webcam feed
  image(camera, 0, 0, 1280, 720);
  camera.loadPixels();

  var smallW = camera.width / 4;
  var smallH = camera.height / 4;

  currImg = createImage(smallW, smallH);
  currImg.copy(camera, 0, 0, camera.width, camera.height, 0, 0, smallW, smallH);
  currImg.filter("gray");
  currImg.filter("blur", 2);

  diffImg = createImage(smallW, smallH);

  spotImg = createImage(smallW / 2, smallH / 2);
  spotImg.copy(
    camera,
    0,
    0,
    camera.width,
    camera.height,
    0,
    0,
    smallW / 2,
    smallH / 2
  );
  spotImg.filter("gray");

  if (typeof prevImg !== "undefined") {
    currImg.loadPixels();
    prevImg.loadPixels();
    diffImg.loadPixels();
    spotImg.loadPixels();

    for (var x = 0; x < currImg.width; x += 1) {
      for (var y = 0; y < currImg.height; y += 1) {
        var index = (x + y * currImg.width) * 4;
        var redCurr = currImg.pixels[index];
        var redPrev = prevImg.pixels[index];
        var d = abs(redCurr - redPrev);

        diffImg.pixels[index + 0] = d;
        diffImg.pixels[index + 1] = d;
        diffImg.pixels[index + 2] = d;
        diffImg.pixels[index + 3] = 255;
      }
    }

    diffImg.updatePixels();
  }

  prevImg = createImage(smallW, smallH);
  prevImg.copy(
    currImg,
    0,
    0,
    currImg.width,
    currImg.height,
    0,
    0,
    smallW,
    smallH
  );

    // apply threshold to separate movement from still areas
  diffImg.filter("threshold", threshold);


  grid.update(diffImg);
}

// grid system
var Grid = function (_w, _h) {
  this.diffImg = 0;

  // spacing and dimensions of the grid
  this.noteWidth = 10; // *** change spacing between each point
  this.worldWidth = _w;
  this.worldHeight = _h;
  this.numOfNotesX = int(this.worldWidth / this.noteWidth);
  this.numOfNotesY = int(this.worldHeight / this.noteWidth);
  this.arrayLength = this.numOfNotesX * this.numOfNotesY;

  // store the movement intensity of each grid position
  this.noteStates = [];
  this.noteStates = new Array(this.arrayLength).fill(0);

  this.colorArray = [];

  // set colours for inactive and active emoji states
  this.colorFresh = color(255, 255, 0);  
  this.colorStale = color(255, 0, 0);   

  console.log(this);
  console.log(_w, _h);

  for (var i = 0; i < this.arrayLength; i++) {
    this.colorArray.push(
      color(218, 165, 32, 150) // *** set colours of the points
    );
  }

  this.update = function (_img) {
    this.diffImg = _img;
    this.diffImg.loadPixels();

     // check each pixel for detected movement
    for (var x = 0; x < this.diffImg.width; x += 1) {
      for (var y = 0; y < this.diffImg.height; y += 1) {
        var index = (x + y * this.diffImg.width) * 4;
        var state = diffImg.pixels[index + 0];

        // activate the corresponding grid position when movement is detected
        if (state == 255) {
          var screenX = map(x, 0, this.diffImg.width, 0, this.worldWidth);
          var screenY = map(y, 0, this.diffImg.height, 0, this.worldHeight);
          var noteIndexX = int(screenX / this.noteWidth);
          var noteIndexY = int(screenY / this.noteWidth);
          var noteIndex = noteIndexX + noteIndexY * this.numOfNotesX;
          this.noteStates[noteIndex] = 1;
        }
      }
    }

    // gradually decrease the intensity to create a fading effect
    for (var i = 0; i < this.arrayLength; i++) {
      this.noteStates[i] -= 0.04; // *** set how long points take to disappear (decimal between 0 - 1)
      this.noteStates[i] = constrain(this.noteStates[i], 0, 1);
    }

    this.draw();
  };

  // draw emojis at grid positions where movement was detected
  this.draw = function () {
    push();
    noStroke();
    for (var x = 0; x < this.numOfNotesX / 2; x++) {
      for (var y = 0; y < this.numOfNotesY / 2; y++) {

        // position each emoji with spacing between grid points
        var posX = this.noteWidth / 2 + 2 * x * this.noteWidth;
        var posY = this.noteWidth / 2 + 2 * y * this.noteWidth;

        // retrieve the movement intensity of the grid position
    var noteIndex = (2 * x) + (2 * y) * this.numOfNotesX;
        var intensity = this.noteStates[noteIndex];


  // change emoji tint based on its movement intensity
     if (intensity > 0) {
         
          var c = lerpColor(this.colorStale, this.colorFresh, intensity);
          tint(c);

            // control individual emoji size
          image(img1, posX, posY, camera.width / 28, camera.height / 28);
        }
      }
    }

    // reset image tint before drawing other elements
    noTint(); 
    pop();

  }

}