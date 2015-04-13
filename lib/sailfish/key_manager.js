var ring = require("ring");
var fs = require("fs-extra");

var keyManagerClass = ring.create({

    constructor: function(app) {
        this.app = app;
    },

    _getKeyRoot: function() {
        return this.app.get("sailfish.configuration")["app_root"]+"/keys";
    },

    getSSHPublicKey: function() {
        var keyRoot = this._getKeyRoot();
        return fs.readFileSync(keyRoot+"/id_dsa.pub").toString().replace("\n", "");
    },

    getSSHPrivateKey: function() {
        var keyRoot = this._getKeyRoot();
        return fs.readFileSync(keyRoot+"/id_dsa").toString();
    }

});

module.exports = function(app) {
    return new keyManagerClass(app);
};