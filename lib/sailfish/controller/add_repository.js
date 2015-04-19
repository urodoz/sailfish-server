var ring = require("ring"),
    _ = require("lodash");

var addRepositoryController = ring.create({

    constructor: function(app, sailfishCollector) {

        var repositoryManager = app.get("repository.manager");

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

                repositoryManager.exists(name, function(existance) {

                    if(existance) {
                        return res.render("addrepository", _.extend(viewParameters, {
                            view: "settings",
                            name: name,
                            repository: repository,
                            branches: branches,
                            error: "A project with the same name is already registered on database",
                            hasError: true
                        }));
                    } else {

                        repositoryManager.create(name, repository, branches, hosts, function(err, doc) {
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

