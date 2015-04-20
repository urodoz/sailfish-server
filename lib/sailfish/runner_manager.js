var colors = require("colors"),
    _ = require("lodash");

var manager = function(app) {

    this.runners = [];

    this.addRunner = function(socket, data, callback) {

        console.log("Runner connected with token ".cyan.bold+data.token.yellow.bold);

        //Register the socket on the application
        this.runners.push({
            token: data.token,
            socket: socket,
            locked: false
        });

        console.log("Registered runner with connection id ".cyan.bold+socket.id+" on application".cyan.bold);

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
        console.log("Runners updated on application".yellow.bold);

        if(_.isEmpty(this.runners)) {
            console.log("  No runners connected".red.bold);
        } else {
            this.runners.forEach(function(runner) {
                console.log("  "+JSON.stringify({
                    token: runner.token,
                    socketId: runner.socket.id,
                    locked: runner.locked
                }).magenta.bold);
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