var _ = require("lodash"),
    rest = require('restler'),
    gitManagerFactory = require("sailfish/git_manager"),
    outputExtractorFactory = require("sailfish/output_extractor");

module.exports = function(app, sailfishCollector) {

    //Project view
    app.get("/project/:projectSlug", function(req, res) {

        var projectSlug = req.params.projectSlug;
        //Try to find
        var projectModel = app.get("model.Project");
        projectModel.findOne({slug: projectSlug}, function(err, projectDoc) {
            if(!err) {
                sailfishCollector.collectInformation(function(err, viewParameters) {

                    //Find one runner
                    //TODO: Apply round robin to available runners
                    app.get("model.Runner").findOne({}, function(err, runnerDoc) {

                        var requestObject = {
                            repository: projectDoc.repository,
                            hosts: projectDoc.hosts.split(","),
                            sshKey: projectDoc.ssh_key.public,
                            sshPrivateKey: new Buffer(projectDoc.ssh_key.public).toString('base64')
                        };

                        var runnerManager = app.get("runner.manager"),
                            runner = runnerManager.getAvailableRunner();

                        if (_.isUndefined(runner)) {
                            //TODO: Control if no runner is available
                        }

                        var runnerSocket = runner.socket;

                        runnerSocket.emit('gitinfo', requestObject, function(gitInfoResponse) {

                            var gitManager = new gitManagerFactory(app);

                            gitManager.prepareCommitsForView(gitInfoResponse.branches, gitInfoResponse.commits, projectDoc, function(preparedCommits) {

                                app.get("build.manager").getLatestBuild(projectDoc.name, function(latestBuild) {

                                    var outputExtractor = null;
                                    if(!_.isNull(latestBuild)) {
                                        outputExtractor = new outputExtractorFactory(JSON.parse(latestBuild.output));
                                    }

                                    var latestBuildParsed = (_.isNull(latestBuild)) ? null : outputExtractor.getPreparedObject();

                                    return res.render("project", _.extend(viewParameters, {
                                        view: "settings",
                                        hasError: false,
                                        project: projectDoc,
                                        branches: gitManager.prepareBranchesForView(gitInfoResponse.branches, projectDoc),
                                        commits: preparedCommits,
                                        latestBuild: latestBuildParsed,
                                        latestBuildDoc: latestBuild
                                    }));

                                });

                            });

                        });

                    });

                });
            } else {
                //TODO: Control error
            }
        });


    });

};
