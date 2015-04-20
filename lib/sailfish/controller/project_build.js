var _ = require("lodash"),
    rest = require('restler'),
    uuid = require("node-uuid"),
    colors = require("colors"),
    async = require("async"),
    gitManagerFactory = require("sailfish/git_manager");

module.exports = function(app, sailfishCollector) {

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
                var runnerManager = app.get("runner.manager"),
                    runner = runnerManager.getAvailableRunner();
                if(_.isUndefined(runner)) {
                    //TODO: Control if no runner is available with feedback to the user
                }

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

                    console.log("Received git information from runner for repository ".yellow.bold+projectDoc.repository);
                    console.log("  branches: ".magenta.bold+JSON.stringify(gitInfoResponse.branches));
                    console.log("  commits : ".magenta.bold+JSON.stringify(gitInfoResponse.commits));

                    gitInfo = gitInfoResponse;
                    var gitManager = new gitManagerFactory(app);
                    latestCommitsInfo = gitManager.latestWatchedCommits(gitInfoResponse.branches, gitInfoResponse.commits, projectDoc);

                    branchesToBuild = _.keys(latestCommitsInfo);
                    console.log("After parsing, branches to build:".yellow.bold);
                    console.log("  > "+JSON.stringify(branchesToBuild));

                    asyncCallback(null);
                });

            },

            //STEP: Parallelize builds
            function(asyncCallback) {

                var seriesTasks = [];
                branchesToBuild.forEach(function(branchToBuild) {
                    var commitToBuild = latestCommitsInfo[branchToBuild];
                    var buildId = uuid.v4();

                    seriesTasks.push(function(callback) {

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

                            console.log("Reporting build to runner with the next configuration:".yellow.bold);
                            console.log("  buildId       : ".cyan.bold+buildId);
                            console.log("  commit        : ".cyan.bold+commitToBuild);
                            console.log("  hosts         : ".cyan.bold+JSON.stringify(reqObj.hosts));
                            console.log("  repository    : ".cyan.bold+projectDoc.repository);


                            //Report the build by socket IO
                            runnerSocket.emit("build", reqObj, function(finalReport) {

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

                        });

                    });

                });

                async.series(seriesTasks, function(err, results){
                    asyncCallback();
                });

            }

        ], function(){
            return null;
        });

    });

};

