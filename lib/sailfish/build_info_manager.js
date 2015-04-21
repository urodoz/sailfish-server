var _ = require("lodash"),
    testSuiteExtractorFactory = require("sailfish/test_suite_extractor");

var buildInfoManagerClass = function(app) {

    this.lightExtract = function(builds) {
        var returnBuilds = [];

        var self = this;
        _.each(builds, function(buildDoc) {
            returnBuilds = _.union(returnBuilds, self._lightExtractBuild(buildDoc));
        });

        return returnBuilds;
    };

    this._lightExtractBuild = function(build) {
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
    };

    this._lightExtractTestResult = function(json) {
        var buildKeys = _.keys(json);
        var returnObject = {};

        returnObject._keys = buildKeys;

        _.each(buildKeys, function(buildKey) {

            var buildKeyOutput = json[buildKey];
            var testSuites = buildKeyOutput.xunit;
            var testSuiteExtractor = new testSuiteExtractorFactory(testSuites);

            returnObject.buildKey = {
                totals: testSuiteExtractor.getTotals()
            };
        });

        return returnObject;
    };

};

module.exports = function(app) {
    return new buildInfoManagerClass(app);
};