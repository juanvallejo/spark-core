/**
 * Firmware for photon core. Turns all LED's on or off
 * Defines 'led' function on the chip.
 * @author juanvallejo
 */

#ifndef FIRMWARE_CPP
#define FIRMWARE_CPP
#endif

#include "application.h"

int led1 = D0;
int led2 = D7;

int toggleLED(String command) {

	if(command == "on") {
		digitalWrite(led1, HIGH);
		digitalWrite(led2, HIGH);
		return 1;
	}

	// assume command is off
	digitalWrite(led1, LOW);
	digitalWrite(led2, LOW);

	return 0;

}

void setup(int argc, char** argv) {

	pinMode(led1, OUTPUT);
	pinMode(led2, OUTPUT);

	// add led function to chip
	Spark.function("led", toggleLED);

	digitalWrite(led1, LOW);
	digitalWrite(led2, LOW);

}