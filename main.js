var arDrone = require('ar-drone');
var _ = require("underscore");
var cv = require('opencv');

var client = arDrone.createClient();

// client.takeoff();

// client
//     .after(5000, function() {
// 	this.clockwise(0.5);
//     })
//     .after(3000, function() {
// 	this.animate('flipLeft', 15);
//     })
//     .after(1000, function() {
// 	this.stop();
// 	this.land();
//    });

client.config("video:video_channel", 3);

var s = new cv.ImageStream()
s.on('data', _.throttle(function(matrix){
    // console.log("matrix: " + matrix);
    var decision = imgDecision(matrix);
    if (decision == 0) {
	console.log("straight");
    } else if (decision < 0) {
	console.log("left");
    } else {
	console.log("right");
    }
}, 500));
// ardrone.createPngStream().pipe(s);
client.getPngStream().pipe(s);

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
    var threshold = 10;
    // img.save('./raw.jpg');
    img.canny(5,300);
    img.houghLinesP();
    // img.save('./processed.jpg');

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

    var straight = Math.abs(avg1 - avg2) < threshold;
    if (straight) {
    	return 0;
    }
    return avg1 - avg2;
}
