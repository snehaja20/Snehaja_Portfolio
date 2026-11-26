/* DM3014 Interactive Devices, Snehaja 2026
 * Week 6 - Teachable Machine
Project Name: "SAY HI". This project uses teachablemachine where I trained the model using variations of 2 poses (still and wave). 
When the user waves at the camera, that pose is detected and sparkles appear. 
Used ChatGPT to assist with implementing the teachable machine model, 
controlling prediction timing, classifying detected poses, and generating sparkle effects.

 */

//variables

const imageModelURL = "https://teachablemachine.withgoogle.com/models/SQTTtEGr8/";

let model;
let video;
let label = "loading....";
let sparkles = [];
let isPredicting = false;


//setup//
async function setup() {
  createCanvas(320, 260);


//initialise webcam and hide default video
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  //load teachable machine model
  model = await tmPose.load(
    imageModelURL + "model.json",
    imageModelURL + "metadata.json"
  );

}


function draw() {
  background(0);

  // show mirrored webcam feed 
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, 320, 240);
  pop();

  // convert detected label to lowercase to avoid differences in capitalisation
 let currentLabel = label.toLowerCase().trim();


  // generate sparkles when the user waves
  if (currentLabel.includes("wave")) {
    if (frameCount % 5 === 0) {
      for (let i = 0; i < 3; i++) {
        sparkles.push(
          new Sparkle(random(width), random(height - 20))
        );
      }
    }
  }

  // update and display all active sparkles
  for (let i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].update();
    sparkles[i].display();

    // remove sparkles once they have faded out
    if (sparkles[i].isFinished()) {
      sparkles.splice(i, 1);
    }
  }

  // display the current pose classification
  fill(255);
  textSize(12);
  textAlign(CENTER);
  text("Label: " + label, width / 2, height - 8);

  // run pose prediction when the model and webcam are ready
  if (model && !isPredicting && video.elt.readyState >= 2) {
    predictPose();
  }
}


// pose prediction

async function predictPose() {
  // Prevent multiple predictions from running simultaneously
  isPredicting = true;

  // Analyse webcam image and classify the detected pose
  const { posenetOutput } = await model.estimatePose(video.elt);
  const predictions = await model.predict(posenetOutput);

  // Find the pose with the highest confidence score
  let bestPrediction = predictions.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );

  // Update the current classification label
  label = bestPrediction.className;

  isPredicting = false;
}


//sparkle class

class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(4, 10);
    this.alpha = 255;

    // assign each sparkle a random colour
    this.color = color(
      random(200, 255),
      random(200, 255),
      random(100, 255)
    );
  }

  // move upwards and gradually fade out
  update() {
    this.alpha -= 10;
    this.y -= random(0.5, 1.5);
  }

  // Draw sparkle shape
  display() {
    noStroke();

    fill(
      red(this.color),
      green(this.color),
      blue(this.color),
      this.alpha
    );

    push();
    translate(this.x, this.y);

    ellipse(0, 0, this.size, this.size);

    rectMode(CENTER);
    rect(0, 0, this.size * 1.8, this.size * 0.3);
    rect(0, 0, this.size * 0.3, this.size * 1.8);

    pop();
  }

  // Check whether the sparkle has completely faded
  isFinished() {
    return this.alpha <= 0;
  }
}



