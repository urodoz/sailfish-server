var keygen = require('ssh-keygen');

/**
 * Class wrapper for keypair library
 * https://github.com/juliangruber/keypair
 */
var classKeyGenerator = function(bits) {

    /**
     * Will generate a key pair and return it with
     * the structure {public:"...", private: "..."}
     *
     * @returns {Object}
     */
    this.generate = function(callback) {
        keygen({
            read: true
        }, function(err, out) {

            callback({
                "public": out.pubKey,
                "private": out.key
            });
        });
    };

};

module.exports = function(bits) {
    return new classKeyGenerator(bits);
};