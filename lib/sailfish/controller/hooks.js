var _ = require("lodash");

module.exports = function(app) {

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

};

