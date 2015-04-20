var _ = require("lodash");

module.exports = function(app, sailfishCollector) {

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

};