var assert = require("assert");
var outputExtractorFactory = require("sailfish/output_extractor");
var _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/test_output_extractor.js
 * @endcode
 */
describe('output extractor', function() {

    it('Simple parsing build with xunit and provision', function(done) {
        var sampleOutput = '{"default":{"build":[{"phase":"provision","command":"pip install nose","stdout":"RG93bmxvYWRpbmcvdW5wYWNraW5nIG5vc2UKSW5zdGFsbGluZyBjb2xsZWN0ZWQgcGFja2FnZXM6IG5vc2UKU3VjY2Vzc2Z1bGx5IGluc3RhbGxlZCBub3NlCkNsZWFuaW5nIHVwLi4uCg==","duration":2014.661315},{"phase":"provision","command":"pip install redis","stdout":"RG93bmxvYWRpbmcvdW5wYWNraW5nIHJlZGlzCiAgUnVubmluZyBzZXR1cC5weSAocGF0aDovdG1wL3BpcF9idWlsZF9yb290L3JlZGlzL3NldHVwLnB5KSBlZ2dfaW5mbyBmb3IgcGFja2FnZSByZWRpcwogICAgCiAgICB3YXJuaW5nOiBubyBwcmV2aW91c2x5LWluY2x1ZGVkIGZpbGVzIGZvdW5kIG1hdGNoaW5nICdfX3B5Y2FjaGVfXycKICAgIHdhcm5pbmc6IG5vIHByZXZpb3VzbHktaW5jbHVkZWQgZmlsZXMgbWF0Y2hpbmcgJyoucHljJyBmb3VuZCB1bmRlciBkaXJlY3RvcnkgJ3Rlc3RzJwpJbnN0YWxsaW5nIGNvbGxlY3RlZCBwYWNrYWdlczogcmVkaXMKICBSdW5uaW5nIHNldHVwLnB5IGluc3RhbGwgZm9yIHJlZGlzCiAgICAKICAgIHdhcm5pbmc6IG5vIHByZXZpb3VzbHktaW5jbHVkZWQgZmlsZXMgZm91bmQgbWF0Y2hpbmcgJ19fcHljYWNoZV9fJwogICAgd2FybmluZzogbm8gcHJldmlvdXNseS1pbmNsdWRlZCBmaWxlcyBtYXRjaGluZyAnKi5weWMnIGZvdW5kIHVuZGVyIGRpcmVjdG9yeSAndGVzdHMnClN1Y2Nlc3NmdWxseSBpbnN0YWxsZWQgcmVkaXMKQ2xlYW5pbmcgdXAuLi4K","duration":1969.866738},{"phase":"commands","command":"nosetests --with-xunit test_sample.py","stdout":"LgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tClJhbiAxIHRlc3QgaW4gMC4wMDJzCgpPSwo=","duration":160.301837}],"xunit":[{"testsuite":{"$":{"name":"nosetests","tests":"1","errors":"0","failures":"0","skip":"0"},"testcase":[{"$":{"classname":"test_sample.TestRedis","name":"test_redis_connection","time":"0.002"}}]}}]}}';
        var outputExtractor = new outputExtractorFactory(JSON.parse(sampleOutput));

        var resultObject = outputExtractor.getPreparedObject();

        //1 package
        assert.equal(_.keys(resultObject).length, 1);
        assert.equal(_.keys(resultObject)[0], "default");
        assert.ok(_.isArray(resultObject["default"]["terminal"]));

        var xunit = resultObject["default"]["xunit"];

        assert.ok(_.isArray(xunit));
        assert.equal(1, xunit.length);

        done();
    });

});