var colors = require('colors');

module.exports = function(app, socket, data) {

    console.log("Runner connected with token ".cyan.bold+data.token.yellow.bold);

    //Register the socket on the application
    var currentRunners = app.get("runners");
    currentRunners.push({
        token: data.token,
        socket: socket
    });;
    app.set("runners", currentRunners);

    console.log("Registered runner with connection id ".cyan.bold+socket.id+" on application".cyan.bold);

    //Emit handshade event
    socket.emit("handshake", {
        handshake: true,
        source: "sailfish-ci-server"
    });

    console.log("Current runners");
    console.log(app.get("runners"));

}