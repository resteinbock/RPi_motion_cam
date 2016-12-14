
if (!process.env.NODE_ENV) {
    throw new Error('invalid NODE_ENV');
}

let config = require('./' + process.env.NODE_ENV);

// look for env vars to add to the config
if (process.env.AWS_ACCESS_KEY) {
    config.AWS.accessKeyId = process.env.AWS_ACCESS_KEY;
}
if (process.env.AWS_SECRET_ACCESS_KEY) {
    config.AWS.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}

module.exports = config;
