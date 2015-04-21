var _ = require("lodash"),
    S = require("string");

var outputExtractorClass = function(json) {

    this.packages = _.keys(json);

    this.getPreparedObject = function() {
        var outputObject = {};

        this.packages.forEach(function(package) {
            outputObject[package] = this.preparePackage(package);
        }, this);

        return outputObject;
    };

    this.preparePackage = function(package) {
        var self = this;
        var outputPackage = json[package];
        var buildInformation = outputPackage.build;

        var lines = [];

        var previousPhase = "init";
        var i = 1;
        _.each(buildInformation, function(buildItem) {

            //Detecting phase change
            var phaseInformation = null;
            if(buildItem.phase!=previousPhase) {
                phaseInformation = buildItem.phase;
                previousPhase = phaseInformation;
            }

            //Adding command executed to output lines
            lines.push({
                number: i,
                output: "<span style='font-weight:bold;color:#fff;'>$ "+buildItem.command+"</span>",
                phase: phaseInformation
            });
            i++;

            //Adding all output line by line
            var stdoutArray = new Buffer(buildItem.stdout, 'base64').toString('utf8').split("\n");

            _.each(stdoutArray, function(stdoutLine) {
                var parsedLined = S(stdoutLine).replaceAll(" ", "&nbsp;").s;
                lines.push({
                    number: i,
                    output: (_.isEmpty(parsedLined)) ? "<span style='color:transparent;'>~</span>" : parsedLined,
                    phase: null
                });
                i++;
            });
        });

        //Pars Xunit if has xunit
        var testSuites = [];
        if(_.has(outputPackage, "xunit")) {
            var xunit = outputPackage.xunit;
            xunit.forEach(function(xunitSuite) {
                testSuites.push(self.parseTestSuiteJson(xunitSuite));
            });
        }

        return {
            terminal: lines,
            xunit: (_.isUndefined(testSuites)) ? null : testSuites
        };
    };

    this.parseTestSuiteJson = function(json) {

        return {
            name: json.testsuite.$.name,
            tests: json.testsuite.$.tests,
            errors: json.testsuite.$.errors,
            failures: json.testsuite.$.failures,
            skip: json.testsuite.$.skip,
            testcase: json.testsuite.testcase
        };
    };



};

module.exports = function(json) {
    return new outputExtractorClass(json);
};