let spawn  = require('child_process').spawn;
let async  = require('async');
let config = require('../config');

module.exports = {
    updateCode        : updateCode,
    checkInternet     : checkInternet,
    restartInternet   : restartInternet,
    restartRpi        : restartRpi,
    gitPullNpmInstall : gitPullNpmInstall,
    foreceRestart     : foreceRestart,
    takePhoto         : takePhoto,
    takePhotoDuration : takePhotoDuration,
    runScript         : runScript,
};

function updateCode(callback) {
    // make sure we have internets first
    // then update the code and restart
    async.series(
        [checkInternet, gitPullNpmInstall],
        callback
    );
}

function checkInternet(callback) {
    // first try restarting the internet connection
    // if all else fails, restart the rpi
    async.series(
        [restartInternet, restartRpi],
        callback
    );
}

function restartInternet(callback) {
    console.log('checking internet, restarting internet...');
    let script = './restart_internet.sh';

    return runScript(script, {}, callback);
}

function restartRpi(callback) {
    console.log('checking internet, restarting rpi...');
    let script = './restart_rpi.sh';

    return runScript(script, {}, callback);
}

function gitPullNpmInstall(callback) {
    console.log('git pull, npm install, restart rpi...');
    let script = './git_npm.sh';

    return runScript(script, {}, callback);
}

function foreceRestart(callback) {
    console.log('forcing rpi restart...');
    let script = './force_restart.sh';

    return runScript(script, {}, callback);
}

function takePhoto(callback) {
    console.log('taking photo...');
    let script = './rpi_photo.sh';
    let env = {
        LOCAL_PATH : path.join(config.LOCAL_FS_PATH, new Date().toUTCString()),
    };

    return runScript(script, env, callback);
}

function takePhotoDuration(callback) {
    console.log('taking photo duration...');
    let script = './rpi_photo_duration.sh';
    let env = {
        LOCAL_PATH  : path.join(config.LOCAL_FS_PATH, new Date().toUTCString()),
        INTERVAL_MS : config.MOTION.INTERVAL_MS,
        DURATION_MS : config.MOTION.DURATION_MS,
    };

    return runScript(script, env, callback);
}

function runScript(script, env, callback) {
    let deploySh = spawn('bash', [script], { cwd : __dirname, env : env });

    deploySh.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    deploySh.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    deploySh.on('close', function (code) {
        console.log('child process exited with code ' + code);

        return callback();
    });
}
