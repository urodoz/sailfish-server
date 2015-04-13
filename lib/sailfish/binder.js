var ring = require("ring");
var request = require("request");
var S = require("string");
var _ = require("underscore");

var binderClass = ring.create({

    constructor: function(app) {
        this.app = app;
    },

    bind: function(runnerName, runnerUrl, callback) {

        var self = this;

        this.app.get("model.Runner").find({"name": runnerName}, function(err, docs) {
            if(err || _.isEmpty(docs)) {

                //Check if ping is OK
                runnerUrl = self._cleanUrl(runnerUrl);

                self.checkPing(runnerUrl, function(err, runnerId) {
                    //Try to bind
                    var sailfishServerEndpoint = self.app.get("sailfish.configuration")["sailfish_host"];
                    self.callBind(runnerUrl, sailfishServerEndpoint, function(runnerId) {

                        //Insert mongo document
                        self._storeRunner(runnerName, runnerUrl, runnerId, function(newDoc) {
                            callback(null, true);
                        });

                    });
                });

            } else {
                callback(new Error("Runner name duplicated: "+runnerName), null);
            }
        });

    },

    _storeRunner: function(runnerName, runnerUrl, runnerId, callback) {
        var Runner = this.app.get("model.Runner");
        var newRunner = new Runner({
            name: runnerName,
            url: runnerUrl,
            token: runnerId
        });
        newRunner.save(function (err) {
            if(err) throw new err
            callback(newRunner);
        });
    },

    _cleanUrl: function(runnerUrl) {
        if(S(runnerUrl).endsWith('/')) {
            runnerUrl = S(runnerUrl).chompRight('/').s;
        }
        return runnerUrl;
    },

    callBind: function(runnerUrl, sailfishServerEndpoint, callback) {
        request(runnerUrl+"/bind?endpoint="+sailfishServerEndpoint, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                var status = json["status"];
                var token = json["token"];

                if(status==="success") {
                    callback(token);
                } else {
                    throw new Error("Cannot bind to runner status is: "+status);
                }

            } else {
                throw new Error("Cannot bind to runner : "+response.statusCode);
            }
        });
    },

    checkPing: function(runnerUrl, callback) {
        request(runnerUrl+"/ping", function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                if(_.isObject(json) && _.has(json, "name") && _.has(json, "id") && (json["name"]=="sailfish-runner")) {
                    //OK
                    callback(null, json["id"]);
                } else {
                    callback(new Error("The url ["+runnerUrl+"] is not a Sailfish runner url"), null);
                }
            } else {
                var statusCode = "unknown";
                if(_.has(response, "statusCode")) statusCode = response.statusCode;
                callback(new Error("Runner unreachable. Status code for "+runnerUrl+"/ping is "+statusCode), null);
            }
        })
    }

});

module.exports = function(app) {
    return new binderClass(app);
};