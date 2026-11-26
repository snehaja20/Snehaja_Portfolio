/*
  DM3014 Interactive Devices, Snehaja 2026
  Week 8 - Microcontrollers & Sensors
Project Name: "Alert!" This project has 2 different interactions playing simultaneously. 
One is the servomotor turning and the other is the LED blinking, both interactions based on the ultrasonic distance sensor.
The closer the user goes to the sensor, the faster the LED blinks and the servomotor reacts as well.
  Used Claude code to assist with the blink speed function. 
  ESP32-C3 Sensor Servo Example
  When distance is less than 10cm, ultrasonic sensor triggers servo to turn 180º.
  Additional Components: Servo Motor, HC-SR04 Sensor
*/

// ====== Reference Libraries ======
#include <ESP32Servo.h>

// ====== Set Servo ======
#define SERVO_PIN 7

// ====== Set LED ======
#define LED_PIN 8

// ====== Set HC-SR04 Sensor ======
#define TRIG_PIN  3
#define ECHO_PIN  4
#define DISTANCE_THRESHOLD  12 // *** edit the sensor trigger distance here (in cm)

// ====== LED Blink  ======
#define MAX_BLINK_DISTANCE 50  
#define MIN_BLINK_INTERVAL 50   
#define MAX_BLINK_INTERVAL 1000

// ====== Create Servo Objects ======
Servo servo;

// ====== Sensor Variables ======
float duration_us, distance_cm;

// ====== Timing Variables ======
unsigned long lastBlinkTime = 0;
unsigned long lastSensorTime = 0;
unsigned long blinkInterval = MAX_BLINK_INTERVAL;
bool ledState = false;

void setup() {
  pinMode(LED_PIN, OUTPUT);

  // ====== Setup Serial Monitor ======
  Serial.begin(115200);

  // ====== Setup Sensor / Servo ======
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  servo.setPeriodHertz(50);
  servo.attach(SERVO_PIN, 500, 2000);
  servo.write(0);
}

void loop() {
  unsigned long now = millis();

  // ====== Read Sensor (every 100 ms) ======
  if (now - lastSensorTime >= 100) {
    lastSensorTime = now;

    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    duration_us = pulseIn(ECHO_PIN, HIGH, 30000);
    if (duration_us > 0) {
      distance_cm = 0.017 * duration_us;
    } else {
      distance_cm = MAX_BLINK_DISTANCE; 
    }

    // ====== Servo Control ======
    if (distance_cm < DISTANCE_THRESHOLD) {
      servo.write(180); // *** edit servo rotation here (0 – 180)
    } else {
      servo.write(50);  // *** edit servo rotation here (0 – 180)
    }

    // ====== Map Distance to Blink Interval ======
    float d = constrain(distance_cm, 0, MAX_BLINK_DISTANCE);
    blinkInterval = map(d, 0, MAX_BLINK_DISTANCE, MIN_BLINK_INTERVAL, MAX_BLINK_INTERVAL);

    // ====== Serial Output ======
    Serial.print("Distance: ");
    Serial.print(distance_cm);
    Serial.print(" cm | Blink interval: ");
    Serial.print(blinkInterval);
    Serial.println(" ms");
  }

  // ====== LED Blink (non-blocking) ======
  if (now - lastBlinkTime >= blinkInterval) {
    lastBlinkTime = now;
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
  }
}