var socket = io.connect(SAILFISH_SERVER);

socket.on('connect', function () {
    socket.emit('browser-connected');
});


socket.on('runners.status', function(runners) {

    $("#runnerContainer").empty();

    if(!_.isEmpty($("#runnerContainer"))) {
        _.each(runners, function(runner) {
            if(runner.locked) {

            } else {

            }

            $("#runnerContainer").append('<li><a href="#" class="button disabled">'+runner.token+'</a></li>');
        });
    }

});