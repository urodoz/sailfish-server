var _ = require("lodash");

var testSuiteExtractorClass = function(testSuites) {


    this.getTotals = function() {
        return {
            tests: this.tests,
            errors: this.errors,
            failures: this.failures,
            skip: this.skip
        };
    };

    this._mergeTotals = function() {
        var accTests = 0;
        var accErrors = 0;
        var accSkip = 0;
        var accFailures = 0;

        _.each(this.testSuites, function(testSuite) {
            var infoShortcut = testSuite.testsuite.$;
            accTests += infoShortcut.tests;
            accErrors += infoShortcut.errors;
            accFailures += infoShortcut.failures;
            accSkip += infoShortcut.skip;
        });

        this.tests = accTests;
        this.errors = accErrors;
        this.failures = accFailures;
        this.skip = accSkip;
    };

    this.testSuites = testSuites;

    //Initial values
    this.tests = 0;
    this.errors = 0;
    this.failures = 0;
    this.skip = 0;

    this._mergeTotals();


};

module.exports = function(testSuites) {
    return new testSuiteExtractorClass(testSuites);
};