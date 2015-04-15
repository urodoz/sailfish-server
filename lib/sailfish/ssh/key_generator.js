var ring = require("ring");
var keypair = require('keypair');

/**
 * Class wrapper for keypair library
 * https://github.com/juliangruber/keypair
 */
var classKeyGenerator = ring.create({

    constructor: function(bits) {
        this.bits = bits;
    },

    /**
     * Will generate a key pair and return it with
     * the structure {public:"...", private: "..."}
     *
     * @returns {Object}
     */
    generate: function() {
        return keypair({
            bits: this.bits
        });
    }

});

module.exports = function(bits) {
    return new classKeyGenerator(bits);
}