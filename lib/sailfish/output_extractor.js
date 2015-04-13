var ring = require("ring");
var _ = require("underscore");
var S = require("string");

var outputExtractorClass = ring.create({

    constructor: function(json) {
        this.json = json;
    },

    getPreparedObject: function() {
        var packages = _.keys(this.json);
        var self = this;

        var outputObject = {};

        _.each(packages, function(package) {
            outputObject[package] = self.preparePackage(package);
        });

        return outputObject;
    },

    preparePackage: function(package) {
        var self = this;
        var outputPackage = this.json[package];
        var buildInformation = outputPackage["build"];

        var lines = [];

        var previousPhase = "init";
        var i = 1;
        _.each(buildInformation, function(buildItem) {

            //Detecting phase change
            var phaseInformation = null;
            if(buildItem["phase"]!=previousPhase) {
                phaseInformation = buildItem["phase"];
                previousPhase = phaseInformation;
            }

            //Adding command executed to output lines
            lines.push({
                number: i,
                output: "<span style='font-weight:bold;color:#fff;'>$ "+buildItem["command"]+"</span>",
                phase: phaseInformation
            });
            i++;

            //Adding all output line by line
            var stdoutArray = new Buffer(buildItem["stdout"], 'base64').toString('utf8').split("\n");

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
        if(_.has(outputPackage, "xunit")) {
            var xunit = outputPackage["xunit"];
            var testSuites = [];
            xunit.forEach(function(xunitSuite) {
                testSuites.push(self.parseTestSuiteJson(xunitSuite));
            });
        }

        return {
            terminal: lines,
            xunit: (typeof(testSuites)=="undefined") ? null : testSuites
        }
    },

    parseTestSuiteJson: function(json) {

        return {
            name: json["testsuite"]["$"]["name"],
            tests: json["testsuite"]["$"]["tests"],
            errors: json["testsuite"]["$"]["errors"],
            failures: json["testsuite"]["$"]["failures"],
            skip: json["testsuite"]["$"]["skip"],
            testcase: json["testsuite"]["testcase"]
        }
    }



});

module.exports = function(json) {
    return new outputExtractorClass(json);
};