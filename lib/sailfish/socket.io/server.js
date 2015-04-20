var eventHandshake = require('./server/event_handshake'),
    _ = require("lodash");

var serverClass = function(server, app) {

    this.io = require('socket.io')(server);

    /*
     * IO context
     */
    this.io.on('connection', function (socket) {

        /*
         * Socket context
         */

        socket.on('runner-connected', function (data) {
            eventHandshake(app, socket, data);
        });

        socket.on('disconnect', function () {
            //Unregister the socket from the runners on app
            var currentRunners = app.get("runners");
            var futureRunners = _.filter(currentRunners, function(n) {
                return (n.socket.id!=socket.id); //All the sockets does not match the current socket are keeped on app
            });
            app.set("runners", futureRunners);
        });

    });

};

module.exports = function(server, app) {
    return new serverClass(server, app);
};
