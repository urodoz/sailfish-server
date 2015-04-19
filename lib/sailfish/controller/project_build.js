var ring = require("ring");
var _ = require("lodash");
var rest = require('restler');
var uuid = require("node-uuid");
var async = require("async");

var buildManagerFactory = require("sailfish/build_manager");
var gitManagerFactory = require("sailfish/git_manager");


var projectBuildController = ring.create({

    constructor: function(app, sailfishCollector) {

        app.get("/quick-project-build/:projectSlug", function(req, res) {

            var projectSlug = req.params.projectSlug;
            //Try to find
            var projectModel = app.get("model.Project");
            projectModel.findOne({slug: projectSlug}, function(err, projectDoc) {
                if(!err) {

                    //Find one runner
                    //TODO: Apply round robin to available runners
                    app.get("model.Runner").findOne({}, function(err, runnerDoc) {

                        var requestObject = {
                            repository: projectDoc.repository,
                            sshKey: projectDoc.ssh_key.public,
                            sshPrivateKey: new Buffer(projectDoc.ssh_key.public).toString('base64'),
                            hosts: projectDoc.hosts.split(",")
                        }

                        rest.post(runnerDoc.url+"/git/info", {
                            data: requestObject,
                        }).on('complete', function(data, response) {

                            var response = data;

                            var gitManager = new gitManagerFactory(app);
                            var latestCommitsInfo = gitManager.latestWatchedCommits(response["branches"], response["commits"], projectDoc);

                            var branchesToBuild = _.keys(latestCommitsInfo);

                            //Get next seq build
                            var buildManager = new buildManagerFactory(app);
                            buildManager.getNextSequence(projectDoc.name, function(nextSeq) {

                                //Creating the parallel builds
                                var parallelTasks = [];
                                _.each(branchesToBuild, function(branchToBuild) {
                                    var commitToBuild = latestCommitsInfo[branchToBuild];
                                    var buildId = uuid.v4();

                                    parallelTasks.push(function(callback) {
                                        var buildModel = app.get("model.Build");
                                        var newBuild = new buildModel({
                                            token: buildId,
                                            sequence: nextSeq,
                                            commit: commitToBuild,
                                            project: projectDoc.name,
                                            output: "",
                                            hosts: projectDoc.hosts,
                                            success: false,
                                            status: "created"
                                        });

                                        nextSeq++; //Adding one to the next build iteration (1 build can contain multiple builds)

                                        newBuild.save(function(err) {
                                            if(err) {
                                                //TODO : Control the error
                                            }

                                            var reqObj = {
                                                buildId: buildId,
                                                commit: commitToBuild,
                                                hosts: projectDoc.hosts.split(","),
                                                repository: projectDoc.repository,
                                                sshKey: projectDoc.ssh_key.public,
                                                sshPrivateKey: new Buffer(projectDoc.ssh_key.public).toString('base64')
                                            }

                                            rest.post(runnerDoc.url+"/build", {
                                                data: reqObj,
                                            }).on('complete', function(data, response) {
                                                //TODO: React when runner is locked, or error on build creation
                                                callback(null, reqObj);
                                            });

                                        });

                                    });

                                });

                                //Executing all the requests to new builds
                                async.parallel(parallelTasks, function(err, results){
                                    res.redirect('/');
                                });

                            });

                        });

                    });

                    //res.redirect('/'); //Redirect to dashboard
                } else {
                    //TODO: Catch error, and redirect to error view
                }
            });


        });

    }

});

module.exports = function(app, sailfishCollector) {
    return new projectBuildController(app, sailfishCollector);
}

