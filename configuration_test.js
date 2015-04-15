var _ = require("underscore");

var configuration = require("./configuration.js");

module.exports = _.extend(configuration, {
    mongo: 'mongodb://172.17.0.2/sailfish_test'
});
