var ring = require("ring"),
    _ = require("lodash"),
    rest = require('restler'),
    uuid = require("node-uuid"),
    colors = require("colors"),
    async = require("async"),
    gitManagerFactory = require("sailfish/git_manager");

var projectBuildController = ring.create({

    constructor: function(app, sailfishCollector) {

        var buildManager = app.get("build.manager");
        var repositoryManager = app.get("repository.manager");

        app.get("/quick-project-build/:projectSlug", function(req, res) {

            var projectSlug = req.params.projectSlug,
                runnerSocket = null,
                gitInfo = null,
                latestCommitsInfo = null,
                branchesToBuild = null,
                projectDoc = null;

            res.redirect('/'); //Redirect while we do the job on the background

            async.waterfall([

                //STEP: Get project
                function(asyncCallback) {
                    repositoryManager.readBySlug(projectSlug, function(err, doc) {
                        projectDoc = doc;
                        asyncCallback(err);
                    });
                },

                //STEP: Get runner socket
                function(asyncCallback) {
                    var currentRunners = app.get("runners");
                    //TODO: Get the first available runner (round robin, etc..), now is getting the first one
                    var runner = _.first(currentRunners);
                    runnerSocket = runner.socket;
                    asyncCallback(null);
                },

                //STEP: Get GIT information
                function(asyncCallback) {

                    var requestObject = {
                        repository: projectDoc.repository,
                        sshKey: projectDoc.ssh_key.public,
                        sshPrivateKey: new Buffer(projectDoc.ssh_key.public).toString('base64'),
                        hosts: projectDoc.hosts.split(",")
                    };

                    runnerSocket.emit('gitinfo', requestObject, function(gitInfoResponse) {

                        gitInfo = gitInfoResponse;
                        var gitManager = new gitManagerFactory(app);
                        latestCommitsInfo = gitManager.latestWatchedCommits(gitInfoResponse["branches"], gitInfoResponse["commits"], projectDoc);

                        branchesToBuild = _.keys(latestCommitsInfo);

                        asyncCallback(null);
                    });

                },

                //STEP: Parallelize builds
                function(asyncCallback) {

                    var parallelTasks = [];
                    _.each(branchesToBuild, function(branchToBuild) {
                        var commitToBuild = latestCommitsInfo[branchToBuild];
                        var buildId = uuid.v4();

                        parallelTasks.push(function(callback) {

                            buildManager.create(projectDoc.name, commitToBuild, projectDoc.hosts.split(","), function(err, newBuild) {

                                if(err) {
                                    //TODO : Control the error
                                }

                                var reqObj = {
                                    buildId: buildId,
                                    commit: commitToBuild,
                                    hosts: (_.isEmpty(projectDoc.hosts)) ? [] : projectDoc.hosts.split(","),
                                    repository: projectDoc.repository,
                                    sshKey: projectDoc.ssh_key.public,
                                    sshPrivateKey: new Buffer(projectDoc.ssh_key.public).toString('base64')
                                };

                                //Report the build by socket IO
                                //TODO: Get the first unlocked runner, now is reporting to the first runner
                                var currentRunners = app.get("runners");
                                if(!_.isEmpty(currentRunners)) {
                                    var socketRunner = currentRunners[0].socket;
                                    socketRunner.emit("build", reqObj, function(finalReport) {

                                        //Received the final report, close the Build model with the report as output
                                        console.log("Received report from runner for buildId ".yellow.bold+buildId);

                                        var BuildModel = app.get("model.Build");
                                        var newOutput = JSON.stringify(finalReport);

                                        var recordMatcher = {token: buildId};
                                        var updateObject = {$set: { output: newOutput, success: true, status: "finished" }};

                                        BuildModel.update(recordMatcher, updateObject, function() {
                                            return null;
                                        });


                                    });
                                }

                            });

                        });

                    });

                    async.parallel(parallelTasks, function(err, results){
                        res.redirect('/');
                    });

                }

            ], function(){

            });

        });

    }

});

module.exports = function(app, sailfishCollector) {
    return new projectBuildController(app, sailfishCollector);
}

