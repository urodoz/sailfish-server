var ring = require("ring");
var _ = require("underscore");

var addRepositoryController = ring.create({

    constructor: function(app, sailfishCollector) {

        app.get('/add-repository', function(req, res) {

            sailfishCollector.collectInformation(function(err, viewParameters) {

                return res.render("addrepository", _.extend(viewParameters, {
                    view: "settings",
                    hasError: false
                }));

            });

        });

        app.post("/add-repository", function(req, res) {

            var name = req.body.project;
            var repository = req.body.repository;
            var branches = req.body.branches;
            var hosts = req.body.hosts;

            //Find the project , i already added show error
            sailfishCollector.collectInformation(function(err, viewParameters) {

                app.get("model.Project").find({name: name}, function(err, docs) {
                    if(!_.isEmpty(docs)) {
                        return res.render("addrepository", _.extend(viewParameters, {
                            view: "settings",
                            name: name,
                            repository: repository,
                            branches: branches,
                            error: "A project with the same name is already registered on database",
                            hasError: true
                        }));
                    } else {
                        //Adding the project to database, and returning to settings
                        var projectModel = app.get("model.Project");
                        var newProject = new projectModel({
                            name: name,
                            slug: slug(name),
                            repository: repository,
                            branches: branches,
                            hosts: hosts
                        });
                        newProject.save(function(err) {
                            if(err) {
                                return res.render("addrepository", _.extend(viewParameters, {
                                    view: "settings",
                                    name: name,
                                    repository: repository,
                                    branches: branches,
                                    error: "Database error: "+err.message,
                                    hasError: true
                                }));
                            } else {
                                res.redirect('/settings');
                            }
                        });

                    }
                });

            });


        });

    }

});

module.exports = function(app, sailfishCollector) {
    return new addRepositoryController(app, sailfishCollector);
}

