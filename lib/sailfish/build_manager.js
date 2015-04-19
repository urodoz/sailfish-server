var ring = require("ring");
var _ = require("lodash");

var buildManagerClass = ring.create({

    constructor: function(app) {
        this.app = app;
    },

    getNextSequence: function(projectName, callback) {
        this.app.get("model.Build").find({"project": projectName}).limit(1).sort('-datetime').exec(function(err, builds) {
            if(_.isEmpty(builds)) {
                callback(1);
            } else {
                var lastSeq = parseInt(builds[0].sequence);
                callback(lastSeq+1);
            }
        });
    },

    getLatestBuild: function(projectName, callback) {
        this.app.get("model.Build").find({"project": projectName, "success": true}).limit(1)
                .sort('-datetime').exec(function(err, builds) {
            if(_.isEmpty(builds)) {
                callback(null);
            } else {
                callback(builds[0]);
            }
        });
    }

});

module.exports = function(app) {
    return new buildManagerClass(app);
};