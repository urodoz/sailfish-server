var ring = require("ring");
var _ = require("underscore");
var testSuiteExtractorFactory = require("sailfish/test_suite_extractor");

var buildInfoManagerClass = ring.create({

    constructor: function(app) {
        this.app = app;
    },

    lightExtract: function(builds) {
        var returnBuilds = [];

        var self = this;
        _.each(builds, function(buildDoc) {
            returnBuilds = _.union(returnBuilds, self._lightExtractBuild(buildDoc));
        });

        return returnBuilds;
    },

    _lightExtractBuild: function(build) {
        var returnObject = {};

        //Basic information
        returnObject.project = build.project;
        returnObject.status = build.status;
        returnObject.sequence = build.sequence;

        var self = this;
        if(!_.isEmpty(build.output)) {
            var testOutput = JSON.parse(build.output);
            returnObject.tests = self._lightExtractTestResult(testOutput);
        } else {
            returnObject.tests = false;
        }

        return [returnObject];
    },

    _lightExtractTestResult: function(json) {
        var buildKeys = _.keys(json);
        var returnObject = {};

        returnObject._keys = buildKeys;

        _.each(buildKeys, function(buildKey) {

            var buildKeyOutput = json[buildKey];
            var testSuites = buildKeyOutput["xunit"];
            var testSuiteExtractor = new testSuiteExtractorFactory(testSuites);

            returnObject.buildKey = {
                totals: testSuiteExtractor.getTotals()
            }
        });

        return returnObject;
    }

});

module.exports = function(app) {
    return new buildInfoManagerClass(app);
};