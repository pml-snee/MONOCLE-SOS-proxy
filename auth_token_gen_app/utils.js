
var crypto = require('crypto');

var count = 0

var utils = {
    gen_key : function(username){
        return crypto.randomBytes(16).toString('hex');
    }
}

module.exports = utils;


