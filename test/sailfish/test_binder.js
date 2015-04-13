var assert = require("assert");
var binderConstructor = require("sailfish/binder");
var _ = require("underscore");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/test_binder.js
 * @endcode
 */
describe("binder", function() {

    it('clean url should remove the last / on the url', function(done) {
        var fakeApp = {
        };

        var binder = binderConstructor(fakeApp);

        assert.equal("http://www.rqlogic.com", binder._cleanUrl('http://www.rqlogic.com'));
        assert.equal("http://www.rqlogic.com", binder._cleanUrl('http://www.rqlogic.com/'));

        done();
    });

    it("check ping on unreachable host, should callback with comprehensible error", function(done) {
        var fakeApp = {
        };

        var binder = binderConstructor(fakeApp);
        binder.checkPing("http://foo.non-valid.adress", function(err, runnerId) {
            assert.ok(!_.isNull(err));
            assert.ok(_.isNull(runnerId));
            done();
        });

    });

});