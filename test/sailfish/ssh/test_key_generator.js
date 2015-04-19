var assert = require("assert"),
    keyGeneratorFactory = require("sailfish/ssh/key_generator"),
    _ = require("lodash"),
    S = require("string");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/ssh/test_key_generator.js
 * @endcode
 */
describe("ssh key_generator", function() {

    this.timeout(3000);

    it('simple check of the keypair generated', function(done) {
        var keyGenerator = new keyGeneratorFactory(1024);
        var keyPair = keyGenerator.generate();

        assert.ok(_.has(keyPair, "public"));
        assert.ok(_.has(keyPair, "private"));
        assert.ok(_.isString(keyPair["public"]));
        assert.ok(_.isString(keyPair["private"]));

        //String content assertions
        assert.ok(S(keyPair["public"]).startsWith("-----BEGIN RSA PUBLIC KEY-----"));
        assert.ok(S(keyPair["private"]).startsWith("-----BEGIN RSA PRIVATE KEY-----"));
        assert.ok(S(keyPair["public"]).contains('-----END RSA PUBLIC KEY-----'));
        assert.ok(S(keyPair["private"]).contains('-----END RSA PRIVATE KEY-----'));

        done();
    });

});