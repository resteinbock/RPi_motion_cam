let fs = require('fs');
let AWS = require('aws-sdk');
let config = require('../config');

AWS.config.update(config.AWS);
let s3 = new AWS.S3();

module.exports = {
    setFile : setFile,
};

/**
 * @summary Saves a local file to s3
 *
 * @param s3Path    {string}    aws key to the file we are writing to in s3
 * @param localPath {string}    local path for the file we are writing to s3
 * @param callback  {function}
 */
function setFile(s3Path, localPath, callback) {
    console.log('http://s3.amazonaws.com/' + config.AWS.bucketName + '/' + s3Path);

    while (s3Path.charAt(0) === '/') {
        // get rid of the first / if one exists
        s3Path = s3Path.substring(1);
    }

    let content = fs.createReadStream(localPath);

    let params = {
        Bucket               : config.AWS.bucketName,
        Key                  : s3Path,
        Body                 : content,
        ACL                  : 'private',
        ServerSideEncryption : 'AES256',
        ContentLength        : content.length,
    };

    return s3.putObject(params, callback);
}

