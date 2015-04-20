var ring = require("ring");
var _ = require("lodash");

var settingsController = ring.create({

    constructor: function(app, sailfishCollector) {

        app.get('/settings', function (req, res) {

            sailfishCollector.collectInformation(function(err, viewParameters) {

                return res.render("settings", _.extend(viewParameters, {
                    view: "settings"
                }));

            });

        });

    }

});

module.exports = function(app, sailfishCollector) {
    return new settingsController(app, sailfishCollector);
};