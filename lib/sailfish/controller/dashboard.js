var _ = require("lodash");

module.exports = function(app, sailfishCollector) {

    app.get('/', function (req, res) {
        //Fetching projects and build information
        sailfishCollector.collectInformation(function(err, viewParameters) {

            return res.render("dashboard", _.extend(viewParameters, {
                view: "dashboard"
            }));

        });

    });

};