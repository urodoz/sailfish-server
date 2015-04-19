var _ = require("lodash")
    uuid = require("node-uuid");

var buildManagerClass = function(models) {

    this.buildModel = models["model.Build"];

    this.getNextSequence = function(projectName, callback) {
        this.buildModel.find({"project": projectName}).limit(1).sort({datetime:-1}).exec(function(err, builds) {
            var nextSeq = 1;
            if(!_.isEmpty(builds)) nextSeq = _.first(builds).sequence+1;
            callback(nextSeq);
        });
    };

    this.getLatestBuild = function(projectName, callback) {
        this.buildModel.find({"project": projectName, "success": true}).limit(1)
                .sort('-datetime').exec(function(err, builds) {
            if(_.isEmpty(builds)) {
                callback(null);
            } else {
                callback(builds[0]);
            }
        });
    };

    this.create = function(projectName, commit, hosts, return_callback) {
        var token = uuid.v4();
        this.getNextSequence(projectName, function(nextSeq) {
            var newBuild = new this.buildModel({
                token: token,
                sequence: nextSeq,
                commit: commit,
                project: projectName,
                output: "", //No output by default
                success: false, //just created!, no success
                hosts: hosts,
                status: "created"
            });
            newBuild.save(function(err) {
                return_callback(err, newBuild);
            });

        });
    };

};

module.exports = function(models) {
    return new buildManagerClass(models);
};