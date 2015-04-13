var ring = require("ring");
var request = require("request");
var _ = require("underscore");
var async = require("async");
var buildInfoManagerFactory = require("sailfish/build_info_manager");

var collectorClass = ring.create({

    constructor: function(app) {
        this.app = app;
    },

    collectInformation: function(return_callback) {

        var self = this;

        async.parallel([
            function(callback) {
                //Fetch runners
                self.app.get("model.Runner").find({}, function(err, runners) {
                    callback(null, runners);
                });
            },
            function(callback) {
                //Fetch projects
                self.app.get("model.Project").find({}, function(err, projects) {
                    callback(null, projects);
                });
            },
            function(callback) {
                //Fetch latest builds
                self.app.get("model.Build").find({}).limit(10).sort('-datetime').exec(function(err, builds) {

                    var buildInfoManager = new buildInfoManagerFactory(self.app);
                    callback(null, buildInfoManager.lightExtract(builds));
                });
            }
        ], function(err, results) {
            return_callback(err, {
                runnersInformation: results[0],
                hasRunners: !_.isEmpty(results[0]),
                projectsInformation: results[1],
                hasProjects: !_.isEmpty(results[1]),
                buildInformation: results[2],
                hasBuilds: !_.isEmpty(results[2]),
            });
        });
    }

});

module.exports = function(app) {
    return new collectorClass(app);
};