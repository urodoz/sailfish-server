var assert = require("assert");
var keyManagerFactory = require("sailfish/key_manager");
var sinon = require("sinon");
var _ = require("underscore");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/test_key_manager.js
 * @endcode
 */
describe("key manager", function() {

    it('key manager should read public and private SSH keys', function(done) {

        var fakeApp = {};
        var keyManager = keyManagerFactory(fakeApp);

        var stubGetKeyRoot = sinon.stub(keyManager, "_getKeyRoot");
        stubGetKeyRoot.onCall(0).returns(__dirname+"/../../keys");
        stubGetKeyRoot.onCall(1).returns(__dirname+"/../../keys");

        var publicKey = keyManager.getSSHPublicKey();
        var privateKey = keyManager.getSSHPrivateKey();

        assert.ok(stubGetKeyRoot.called);

        assert.ok(!_.isEmpty(publicKey));
        assert.ok(!_.isEmpty(privateKey));
        assert.ok(_.isString(publicKey));
        assert.ok(_.isString(privateKey));

        keyManager._getKeyRoot.restore();
        done();
    });

});