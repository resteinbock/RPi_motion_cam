let Gpio = require('onoff').Gpio;
const config = require('../lib/config');

let pir = new Gpio(config.MOTION.PIR_GPIO, 'in', 'both');
let led = new Gpio(config.MOTION.LED_GPIO, 'out');
const TIME = 60 * 1000;

console.log('test started...');

pir.watch(function (err, value) {
    if (err) {
        led.unexport();
        pir.unexport();
        console.log(err);
        return;
    }

    led.writeSync(value);
    console.log(value);
});

setTimeout(
    function() {
        led.unexport();
        pir.unexport();
        console.log('test ended...');
    },
    TIME
)
