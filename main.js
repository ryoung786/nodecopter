// var arDrone = require('ar-drone');
var cv = require('opencv');

var client = arDrone.createClient();

client.takeoff();

client
    .after(5000, function() {
	this.clockwise(0.5);
    })
    .after(3000, function() {
	this.animate('flipLeft', 15);
    })
    .after(1000, function() {
	this.stop();
	this.land();
   });

var stream = client.getPngStream();

stream.on('data', function(png) {
});

// cv.readImage("example-images/out-left.png", function(err, img){
//     console.log("decision: " + imgDecision(img));
// })

// cv.readImage("example-images/2.png", function(err, img){
//     console.log("decision: " + imgDecision(img));
// })
// cv.readImage("example-images/3.png", function(err, img){
//     console.log("decision: " + imgDecision(img));
// })

// if 0, go straight
// if < 0, turn left
// if > 0, turn right
function imgDecision(img) {
    var threshold = 5;
    img.canny(5,300);
    img.save('./out.jpg');

    var line, lines = [];
    lines[0] = 20;//Math.round( Math.random() * 320 );
    lines[1] = 200;//Math.round( Math.random() * 320 );

    var count = 0, sum = 0;
    for (var i=0; i<640; i++) {
	var value = img.row(lines[0])[i];
	if (value) {
	    sum+=i;
	    count++;
	}
    }
    var avg1 = sum / count;

    count = 0;
    sum = 0;
    for (i=0; i<640; i++) {
	var value = img.row(lines[1])[i];
	if (value) {
	    sum+=i;
	    count++;
	}
    }
    var avg2 = sum / count;
    console.log(avg1 + ', ' + avg2);

    var straight = Math.abs(avg1 - avg2) < threshold;
    if (straight) {
    	return 0;
    }
    return avg1 - avg2;
}
