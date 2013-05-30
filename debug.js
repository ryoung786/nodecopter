var arDrone = require('ar-drone');
var client = arDrone.createClient();

// Reset EMERGENCY STOP
client.disableEmergency();

// enable telemetry capture
client.config('general:navdata_demo', 'FALSE');

client.on('navdata', function(data) {
  if (data.droneState.lowBattery) {console.log('Low battery!');}

  if (data.droneState.MagnometerNeedsCalibration) {
    client.calibrate(0);
  }
});

var navdata, counter = 0,
ex = [],
mx, my, mz, allstop,
targetX = -33, range = 1;

client.land();

console.log('Taking off');

client.takeoff(function() {

  client.after(100, function() {

    this.on('navdata', function payload(data) {
      var magneto = data.magneto;
      mx = magneto.mx;
      my = magneto.my;
      mz = magneto.mz;
      counter++;

      if (ex.length > 2) {
        ex.pop();
      }
      ex.push(mx);

      var average = ex.reduce(function(o, x) { return o+x/ex.length; }, 0);

      if (allstop) { return; }

      if (payload.adjusted) {
        var direction = (mx-targetX > 0) ? 'clockwise' : 'counterClockwise',
        value = (Math.abs( mx - targetX ) - range)/100;
        //client[direction](value);
        //console.log('adjusting '+direction+': '+value+','+average);
        if( !(counter%100) ) {
          console.log(average);
        }
      }
      else if (Math.abs( mx - targetX ) < range) {
        client.stop();
        payload.adjusted = true;
        forward();
      }
    });

    console.log('first adjustment');
    this.clockwise(0.5);
  });
});

function forward() {
  if (forward.called) { return; }

  console.log('forward');

  client
  .after(100, function() {
    this.front(0.3);
  })
  .after(2860, function() {
    console.log('stopping');
    allstop = true;
    this.stop();
    this.land();
  });
  forward.called = true;
}
