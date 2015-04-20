var colors = require('colors');

module.exports = function(app, socket, data) {

    app.get("runner.manager").addRunner(socket, data, function() {
        //Emit handshade event
        socket.emit("handshake", {
            handshake: true,
            source: "sailfish-ci-server"
        });
    });

};