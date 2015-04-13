var ring = require("ring");
var sailfishBinderFactory = require("sailfish/binder");
var _ = require("underscore");

var addRunnerController = ring.create({

    constructor: function(app, sailfishCollector) {
        app.get('/add-runner', function(req, res) {

            sailfishCollector.collectInformation(function(err, viewParameters) {

                return res.render("addrepository", _.extend(viewParameters, {
                    view: "settings",
                    hasError: false
                }));

            });

        });

        app.post('/add-runner', function(req, res) {

            sailfishCollector.collectInformation(function(err, viewParameters) {

                //Trying to bind
                var binder = new sailfishBinderFactory(app);

                binder.bind(req.body.name, req.body.endpoint, function(err, result) {

                    if(err) {
                        return res.render("addrunner", _.extend(viewParameters, {
                            view: "settings",
                            name: req.body.name,
                            endpoint: req.body.endpoint,
                            error: err.message,
                            hasError: true
                        }));
                    } else {
                        res.redirect('/settings');
                    }

                });

            });

        });
    }

});

module.exports = function(app, sailfishCollector) {
    return new addRunnerController(app, sailfishCollector);
}