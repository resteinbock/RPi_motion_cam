let Gpio = require('onoff').Gpio;
let async = require('async');
const config = require('../lib/config');

let led = new Gpio(config.MOTION.LED_GPIO, 'out');
const LIMIT = 20;
const INTERVAL = 200;
let i = 0;

console.log('test started...');

async.whilst(
    function() { return i < LIMIT; },
    function(cb) {
        i++;
        setTimeout(
            function() {
                return led.write(i%2, cb);
            },
            INTERVAL
        )
    },
    function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('test ended...');
        }
        led.unexport();
    }
);
