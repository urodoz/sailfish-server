var colors = require("colors"),
    _ = require("lodash");

var manager = function(app) {

    this.runners = [];

    this.addRunner = function(socket, data, callback) {

        app.get("logger").info("Runner connected", {token: data.token});

        //Register the socket on the application
        this.runners.push({
            token: data.token,
            socket: socket,
            locked: false
        });

        app.get("logger").log("Registered runner", {socketId:socket.id});

        this.reportRunnersOnConsole();
        this.emitStatus();
        callback();
    };

    this.getAvailableRunner = function() {
        return _.find(this.runners, {locked: false});
    };

    this.removeRunner = function(socket) {
        //Unregister the socket from the runners on app
        var currentRunners = this.runners;
        var futureRunners = _.filter(currentRunners, function(n) {
            return (n.socket.id!=socket.id); //All the sockets does not match the current socket are keeped on app
        });
        this.runners = futureRunners;
        this.reportRunnersOnConsole();
        this.emitStatus();
    };

    this.reportRunnersOnConsole = function() {
        app.get("logger").info("Updated runners information");

        if(_.isEmpty(this.runners)) {
            app.get("logger").warn("No runners connected");
        } else {
            this.runners.forEach(function(runner) {
                app.get("logger").info("runner information", {
                    token: runner.token,
                    socketId: runner.socket.id,
                    locked: runner.locked
                });
            }, this);
        }

    };

    /**
     * Emit a basic version of runner statuses to all sockets
     * listening
     *
     * @return void
     */
    this.emitStatus = function() {
        var emitData = [];
        this.runners.forEach(function(runner) {
            emitData.push({
                token: _.first(runner.token.split("-")), //short id
                locked: runner.locked
            });
        }, this);
        app.get("io.sockets").emit("runners.status", emitData);
    };

};

module.exports = function(app) {
    return new manager(app);
};