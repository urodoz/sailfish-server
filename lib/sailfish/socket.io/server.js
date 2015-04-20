var eventHandshake = require('./server/event_handshake');

var serverClass = function(server, app) {

    this.io = require('socket.io')(server);

    /*
     * IO context
     */
    this.io.on('connection', function (socket) {

        /*
         * Socket context (server2browser)
         */
        socket.on("browser-connected", function() {
            app.get("runner.manager").emitStatus();
        });

        /*
         * Socket context (server2server)
         */

        socket.on('runner-connected', function (data) {
            eventHandshake(app, socket, data);
        });

        socket.on('disconnect', function () {
            app.get("runner.manager").removeRunner(socket);
        });

    });

};

module.exports = function(server, app) {
    return new serverClass(server, app);
};
