var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.takeoff(
	function() {
		client.calibrate(0);
		client.after( 5000, function() {
			client.land();
		})
	}
);
