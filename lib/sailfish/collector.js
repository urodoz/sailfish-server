var request = require("request"),
    _ = require("lodash"),
    async = require("async"),
    buildInfoManagerFactory = require("sailfish/build_info_manager");

var collectorClass = function(app) {

    this.collectInformation = function(return_callback) {

        async.parallel([
            function(callback) {
                //Fetch projects
                app.get("model.Project").find({}, function(err, projects) {
                    callback(null, projects);
                });
            },
            function(callback) {
                //Fetch latest builds
                app.get("model.Build").find({}).limit(10).sort('-datetime').exec(function(err, builds) {

                    var buildInfoManager = new buildInfoManagerFactory(app);
                    callback(null, buildInfoManager.lightExtract(builds));
                });
            }
        ], function(err, results) {
            return_callback(err, {
                projectsInformation: results[0],
                hasProjects: !_.isEmpty(results[0]),
                buildInformation: results[1],
                hasBuilds: !_.isEmpty(results[1]),
                sailfishHost: app.get("sailfish.configuration").sailfish_host
            });
        });
    };

};

module.exports = function(app) {
    return new collectorClass(app);
};