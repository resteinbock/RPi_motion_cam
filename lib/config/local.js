let path = require('path');

module.exports = {
    LOCATION : 'local',

    LOCAL_FS_PATH : path.join(__dirname, '/../../.tmp/'),
    LOG_PATH      : path.join(__dirname, '/../../logs/camera.log'),

    DEBUG : true,

    MODE : 'ON_DEMAND',

    MOTION : {
        LED_GPIO    : 17,
        PIR_GPIO    : 18,
        INTERVAL_MS : 15 * 1000,
        DURATION_MS : 2 * 60 * 1000
    },

    TIME_LAPSE : {
        INTERVAL_MIN : 10,
        DAYS         : [false, true, true, true, true, true, false],
        HOURS        : {
            START : 7,
            STOP  : 17
        }
    },

    AWS : {
        accessKeyId     : '',
        secretAccessKey : '',
        bucketName      : 'resteinbock.rpicam',
        region          : 'us-east-1',
        acl             : 'private',
        maxRetries      : 5
    }
};
