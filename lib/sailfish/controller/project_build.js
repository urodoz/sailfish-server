var _ = require("lodash"),
    rest = require('restler'),
    uuid = require("node-uuid"),
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

                    app.get("logger").info("Received git information from runner for repository", {
                        repository: projectDoc.repository,
                        branches: gitInfoResponse.branches
                    });

                    gitInfo = gitInfoResponse;
                    var gitManager = new gitManagerFactory(app);
                    latestCommitsInfo = gitManager.latestWatchedCommits(gitInfoResponse.branches, gitInfoResponse.commits, projectDoc);

                    branchesToBuild = _.keys(latestCommitsInfo);
                    app.get("logger").info("Branches to build", {branches:branchesToBuild});

                    asyncCallback(null);
                });

            },

            //STEP: Parallelize builds
            function(asyncCallback) {

                var seriesTasks = [];
                branchesToBuild.forEach(function(branchToBuild) {
                    var commitToBuild = latestCommitsInfo[branchToBuild];

                    seriesTasks.push(function(callback) {

                        buildManager.create(projectDoc.name, commitToBuild, projectDoc.hosts.split(","), function(err, newBuild) {

                            var buildId = newBuild.token;

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

                            app.get("logger").info("Reporting build to runner with the next configuration", {
                                buildId: buildId, commit: commitToBuild, hosts: reqObj.hosts, repository: projectDoc.repository
                            });

                            //Report the build by socket IO
                            runnerSocket.emit("build", reqObj, function(finalReport) {

                                //Received the final report, close the Build model with the report as output
                                app.get("logger").info("Received report from runner", {buildId:buildId});

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

