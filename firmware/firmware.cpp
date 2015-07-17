/**
 * Firmware for photon core. Turns all LED's on or off
 * Defines 'led' function on the module.
 * @author juanvallejo
 */

#ifndef FIRMWARE_CPP
#define FIRMWARE_CPP
#endif

#include "application.h"

int led1 = D0;
int led2 = D7;

int toggleLED(String command) {

	int pin1State = digitalRead(led1);
	int pin2State = digitalRead(led2);

	if(command == "one") {
		
		if(pin1State == 1) {
			digitalWrite(led1, LOW);
		} else {
			digitalWrite(led1, HIGH);
		}

		return !pin1State;

	}

	if(command == "two") {
		
		if(pin2State == 1) {
			digitalWrite(led2, LOW);
		} else {
			digitalWrite(led2, HIGH);
		}

		return !pin2State;

	}

	if(command == "both") {

		if(pin1State == HIGH) {
			digitalWrite(led1, LOW);
		} else {
			digitalWrite(led1, HIGH);
		}

		if(pin2State == HIGH) {
			digitalWrite(led2, LOW);
		} else {
			digitalWrite(led2, HIGH);
		}

		return 0;

	}

	return 1;

}

void setup() {

	pinMode(led1, OUTPUT);
	pinMode(led2, OUTPUT);

	// add led function to chip
	Spark.function("toggleLED", toggleLED);

}