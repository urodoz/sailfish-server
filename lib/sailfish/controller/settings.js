var _ = require("lodash");

module.exports = function(app, sailfishCollector) {

    app.get('/settings', function (req, res) {

        sailfishCollector.collectInformation(function(err, viewParameters) {

            return res.render("settings", _.extend(viewParameters, {
                view: "settings"
            }));

        });

    });

};