let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let readline = require('readline');
let async = require('async');
let Gpio = require('onoff').Gpio;

let config = require('./config');
let util = require('./util');
let rpiAWS = require('./AWS');

let uploading = false;

module.exports = {
    start : start
};

function start() {
    console.log('starting camera...');

    // make sure the photo directory exist
    mkdirp.sync(config.LOCAL_FS_PATH);

    // do stuff depending on the mode
    switch(config.MODE) {
        case('MOTION'):
            motion();
            break;
        case('ON_DEMAND'):
            keyPress();
            break;
        case('TIME_LAPSE'):
        default:
            timeLapse();
            break;
    }
}

function errorHandler(err) {
    if (typeof err === 'undefined' || err === null) {
        return;
    }

    console.error(err);
    console.trace(err);

    if (typeof err.code === 'undefined' || err.code === null) {
        return;
    }

    // do special stuff for some errors
    err.code = err.code.toUpperCase();
    switch(err.code) {
        case('ENOTFOUND'):
        case('ECONNRESET'):
            // internet is probably not connected
            return util.checkInternet(function () {
                // if execution makes it here, then we have internet!
                // so restart the camera
                console.log('Guess we have the internets. Restarting the camera...');
                return start(false);
            });
            break;
        case('ENOSPC'):
            // no space... try removing some stuff and then restart the camera without taking a pic on startup
            return deleteLocal(function () {
                return start(false);
            });
            break;
        default:
            // not sure what happened...
            return start(false);
            break;
    }

    // do not do anything here
}

function motion() {
    let led = new Gpio(config.MOTION.LED_GPIO, 'out');
    let pir = new Gpio(config.MOTION.PIR_GPIO, 'in', 'both');
    let takingPics = false;

    pir.watch(function (err, value) {
        if (err) {
            led.unexport();
            pir.unexport();
            return errorHandler(err);
        }

        led.writeSync(value);

        if(value === 1) {
            console.log('Intruder detected');
            if (!takingPics) {
                takePhotoDuration();
            }
        }
    });
}

function keyPress() {
    let rl = readline.createInterface({
        input  : process.stdin,
        output : process.stdout,
    });

    rl.question('Press any key to take a photo...', function (answer) {
        console.log('taking on demand photo');
        rl.close();

        takePhoto();
        keyPress();
    });
}

function timeLapse() {
    console.log('waiting ' + config.TIME_LAPSE.INTERVAL_MIN + ' minutes...');

    setTimeout(
        function () {
            if (checkTime()) {
                takePhoto();
            }
            timeLapse();
        },
        config.TIME_LAPSE.INTERVAL_MIN * 60 * 1000
    );
}

function checkTime() {
    let now = new Date();

    // check day of week
    let day = now.getDay();
    if (config.TIME_LAPSE.DAYS[day] === false) {
        console.log('not taking today: ' + day);
        return false;
    }

    // check the hour
    let hour = now.getHours();
    if (hour < config.TIME_LAPSE.HOURS.START) {
        console.log('too early: ' + hour);
        return false;
    } else if (hour > config.TIME_LAPSE.HOURS.STOP) {
        console.log('too late: ' + hour);
        return false;
    }

    // within time window to tak a pic!
    return true;
}

function takePhoto() {
    util.takePhoto(function (err) {
        if (err) {
            return errorHandler(err);
        }

        if (!uploading) {
            uploadPhotos();
        }
    });
}

function takePhotoDuration() {
    util.takePhotoDuration(function (err) {
        if (err) {
            return errorHandler(err);
        }

        if (!uploading) {
            uploadPhotos();
        }
    });
}

function uploadPhotos() {
    fs.readdir(config.LOCAL_FS_PATH, function (err, names) {
        if (err) {
            return errorHandler(err);
        }

        if (!names || !names.length || names.length === 0) {
            console.log('no more files to upload');
            uploading = false;
            return;
        }

        let localPath = path.join(config.LOCAL_FS_PATH, names[0]);
        let s3Path = path.join(config.LOCATION, names[0]);

        async.series(
            [
                function (seriesCb) {
                    return rpiAWS.setFile(s3Path, localPath, seriesCb);
                },
                function (seriesCb) {
                    return fs.unlink(localPath, seriesCb);
                },
            ],
            function (err) {
                if (err) {
                    return errorHandler(err);
                }

                uploadPhotos();
            }
        );
    });
}

function deleteLocal(callback) {
    // assumes there are only files (no child directories) in the local directory
    console.log('deleting local photos...');

    // cycle through the files in the local directory and delete them
    fs.readdir(config.LOCAL_FS_PATH, function (err, names) {
        if (err) return callback(err);

        if (!names || !names.length || names.length === 0) {
            console.log('no files to delete');
            return callback();
        }

        async.eachSeries(
            names,
            function (name, eachCb) {
                // delete the file
                let filePath = path.join(config.LOCAL_FS_PATH, name);
                console.log('deleting - ' + filePath);
                return fs.unlink(filePath, eachCb);
            },
            callback
        );
    });
}
