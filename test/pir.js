let Gpio = require('onoff').Gpio;
const config = require('./lib/config');

let pir = new Gpio(config.MOTION.PIR_GPIO, 'in', 'both');
const TIME = 60 * 1000;

pir.watch(function (err, value) {
    if (err) {
        return pir.unexport();
    }

    console.log(value);
});

setTimeout(
    function() {
        return pir.unexport();
    },
    TIME
)
