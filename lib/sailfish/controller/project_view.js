var ring = require("ring");
var _ = require("underscore");
var rest = require('restler');
var keyManagerFactory = require("sailfish/key_manager");
var gitManagerFactory = require("sailfish/git_manager");
var buildManagerFactory = require("sailfish/build_manager");
var outputExtractorFactory = require("sailfish/output_extractor");

var projectViewController = ring.create({

    constructor: function(app, sailfishCollector) {

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

                            var keyManager = new keyManagerFactory(app);

                            var requestObject = {
                                repository: projectDoc.repository,
                                hosts: projectDoc.hosts.split(","),
                                sshKey: keyManager.getSSHPublicKey().replace("+", "%20"),
                                sshPrivateKey: new Buffer(keyManager.getSSHPrivateKey()).toString("utf8").replace("+", "%20").toString('base64')
                            }

                            rest.post(runnerDoc.url+"/git/info", {
                                data: requestObject,
                            }).on('complete', function(data, response) {

                                var gitManager = new gitManagerFactory(app);
                                var response = data;

                                gitManager.prepareCommitsForView(response["branches"], response["commits"], projectDoc, function(preparedCommits) {

                                    var buildManager = new buildManagerFactory(app);
                                    buildManager.getLatestBuild(projectDoc.name, function(latestBuild) {

                                        if(!_.isNull(latestBuild)) {
                                            var outputExtractor = new outputExtractorFactory(JSON.parse(latestBuild.output));
                                        }

                                        var latestBuildParsed = (_.isNull(latestBuild)) ? null : outputExtractor.getPreparedObject();

                                        return res.render("project", _.extend(viewParameters, {
                                            view: "settings",
                                            hasError: false,
                                            project: projectDoc,
                                            branches: gitManager.prepareBranchesForView(response["branches"], projectDoc),
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

    }

});

module.exports = function(app, sailfishCollector) {
    return new projectViewController(app, sailfishCollector);
}
