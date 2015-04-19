var ring = require("ring");
var _ = require("lodash");

var hooksController = ring.create({

    constructor: function(app) {

        /*
         * Action to finalize a pendin build. Will close the record
         * on the database, and will store the report JSON received for the
         * provision and the xunit result if any
         */
        app.get("/build-finish", function(req, res) {

            var json = JSON.parse(req.query["json"]);
            var buildId = json["buildId"];
            var result = json["result"];

            var BuildModel = app.get("model.Build");
            var newOutput = JSON.stringify(result);

            var recordMatcher = {token: buildId};
            var updateObject = {$set: { output: newOutput, success: true, status: "finished" }};

            BuildModel.update(recordMatcher, updateObject, function() {
                return "OK";
            });

        });

        /**
         * Action to detect the step change on the project. The available steps reported
         * by the runner are : pulling, provisioning, running (intermediate points), the creation
         * is done from the server side, and the end step is done by reporting /build-finish
         */
        app.get("build/update/:buildId/:step", function(req, res) {

            var buildId = req.params.buildId;
            var step = req.params.step;

            if(!_.contains(["pulling","provisioning","running"], step)) {
                //TODO: Step not allowed, report error
            }

            //The step is allowed, update the build with the step
            var BuildModel = app.get("model.Build");
            var recordMatcher = {token: buildId};
            var updateObject = {$set: { status: step }};

            BuildModel.update(recordMatcher, updateObject, function() {
                return "OK";
            });
        });

    }

});

module.exports = function(app) {
    return new hooksController(app);
}

