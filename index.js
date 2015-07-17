/**
 * Particle program. Creates session from login credentials
 * and attaches device to session.
 * @author juanvallejo
 */

var fs 				= require('fs'); 
var spark 			= require('spark');

var CONFIG_PATH 	= './config.json';

// default settings
var TOKEN 			= null;
var USER 			= 'juan.vallejo.12@cnu.edu';
var PASS 			= 'particle io';
var CLAIM 			= 'NZT48';

CONFIG_PATH = process.argv[2] || CONFIG_PATH;

// create config file if not exists
fs.open(CONFIG_PATH, 'a+', function(err) {

	if(err) {
		return console.log('An error occurred preparing configuration file -> ' + err.toString());
	}

	fs.readFile(CONFIG_PATH, function(err, data) {

		if(err) {
			return console.log('An error occurred attempting to read configuration file -> ' + err.toString());
		}

		if(data.toString() == '' || !data) {
			
			// init config file
			_updateConfigFile(function(err) {

				if(err) {
					return console.log('An error occurred while initializing configuration file -> ' + err);
				}

				login();

			});

		} else {
			_parseConfigFile(data);
		}

	});

});

/**
 * configuration file functions
 */

// prepare configuration file with default options
// for the first time
function _updateConfigFile(callback) {

	var fileData = {
		'session_token': TOKEN,
		'device_name': CLAIM,
		'username': USER,
		'password': PASS
	};

	fs.writeFile(CONFIG_PATH, JSON.stringify(fileData), function(err) {

		if(err) {
			
			if(typeof callback != 'function') {
				return console.log('An error occurred initializing configuration file settings -> ' + err.toString());
			}

			return callback.call(this, err.toString());

		}

		

		// call function
		if(typeof callback != 'function') {
			return console.log('Successfully updated configuration file -> ' + CONFIG_PATH);
		}
		
		callback.call(this);
	
	});

}

function _parseConfigFile(dataBuffer) {

	try {

		var data 	= JSON.parse(dataBuffer.toString());

		TOKEN 		= data.session_token;
		USER 		= data.username;
		PASS 		= data.password;
		CLAIM 		= data.device_name;

		login();

	} catch(e) {
		console.log('Exception caught while reading config file settings -> ' + e.toString());
	}

}

// once a config file is acquired, login
function login() {

	// acquire a token if one is not present
	if(!TOKEN) {

		return spark.login({ username: USER, password: PASS }, function(err, data) {

			if(err) {
				return console.log('An error occurred logging in with credentials -> ' + err.toString());
			}

			try {

				TOKEN = data.access_token;

				var fileData = {
					'session_token': TOKEN,
					'device_name': CLAIM,
					'username': USER,
					'password': PASS
				};

				// write updated settings to configuration file
				_updateConfigFile(function(err) {

					if(err) {
						return console.log('An error occurred updating authorization token in config file -> ' + err);
					}

					fetchDeviceList();

				});

			} catch(e) {
				console.log('Exception caught while converting response body to an object -> ' + e.toString());
			}

		});

	}

	console.log('Access token detected, logging in...');

	// if a token is detected, simply login
	// and call fetchDeviceList()
	spark.login({ accessToken: TOKEN }, function(err, body) {
		
		if(err) {
			
			console.log('An error occurred logging in with an existing token -> ' + err.toString());
			console.log('Acquiring new session token...');

			TOKEN = null;

			return login();

		}

		fetchDeviceList();

	});

}

// fetch list of devices
function fetchDeviceList() {

	var devices = spark.listDevices();

	// act on promise
	devices.then(function(deviceList) {

		var claimed = false;

		// loop through list of devices returned, looking for
		// the one we wish to claim. Once found, start claimCore
		for(var i = 0; i < deviceList.length && !claimed; i++) {
			if(deviceList[i].name == CLAIM) {
				claimed = true;
				claim(deviceList[i].id);
			}
		}

		if(!claimed) {
			console.log('An error occurred attempting to claim device -> Check your claim name.');
		}

	}, function(err) {
		console.log('List devices call failed -> ' + err.toString());
	});

}

// second step in program after obtaining
// device list. Claim device to current session
// and bring it online.
function claim(deviceId) {

	console.log('Attempting to claim device with ID ' + deviceId);

	spark.claimCore(deviceId, function(err, data) {

		if(err) {
			return console.log('An error occurred claiming device with ID ' + deviceId + ' -> ' + err.toString());
		}

		if(!data.ok) {
			
			console.log('Warning: device connection not okay:');
			
			for(var i = 0; i < data.errors.length; i++) {
				console.log('\t- ' + data.errors[i].toString());
			}

			return;

		}

		console.log('Device claimed successfully.');

		spark.getDevice(deviceId, function(err, device) {
			init(device);
		});

	});

}

// initialize program after the device
// has been claimed
function init(device) {

	// turn on leds
	device.callFunction('toggleLED', 'both', function(err, data) {

		console.log('callback function');

		if(err) {
			return console.log('An error occurred executing led function -> ' + err.toString());
		}

		console.log(data);

	});
}