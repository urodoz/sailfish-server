var ring = require("ring");
var _ = require("underscore");

var dashboardController = ring.create({

    constructor: function(app, sailfishCollector) {

        app.get('/', function (req, res) {
            //Fetching projects and build information
            sailfishCollector.collectInformation(function(err, viewParameters) {

                return res.render("dashboard", _.extend(viewParameters, {
                    view: "dashboard"
                }));

            });

        });

    }

});

module.exports = function(app, sailfishCollector) {
    return new dashboardController(app, sailfishCollector);
}