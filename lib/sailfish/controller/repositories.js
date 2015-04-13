var ring = require("ring");
var _ = require("underscore");

var repositoriesController = ring.create({

    constructor: function(app, sailfishCollector) {

        app.get('/settings/repositories', function (req, res) {
            sailfishCollector.collectInformation(function(err, viewParameters) {

                app.get("model.Project").find({}, function(err, projects) {
                    return res.render("repositories", _.extend(viewParameters, {
                        view: "settings",
                        projects: projects
                    }));
                });

            });

        });

    }

});

module.exports = function(app, sailfishCollector) {
    return new repositoriesController(app, sailfishCollector);
}