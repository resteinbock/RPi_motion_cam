let Gpio = require('onoff').Gpio;
const config = require('../lib/config');

let pir = new Gpio(config.MOTION.PIR_GPIO, 'in', 'both');
const TIME = 60 * 1000;

console.log('test started...');

pir.watch(function (err, value) {
    if (err) {
        pir.unexport();
        console.log(err);
        return;
    }

    console.log(value);
});

setTimeout(
    function() {
        pir.unexport();
        console.log('test ended...');
    },
    TIME
)
