var express = require('express'),
    app = express(),
    configuration = require("./configuration.js"),
    twig = require('twig'),
    _ = require("underscore"),
    mongoose = require('mongoose'),
    slug = require('slug'),
    collectorClass = require("sailfish/collector"),
    request = require("request"),
    fs = require("fs-extra"),
    async = require("async"),
    uuid = require("node-uuid"),
    rest = require('restler');

//Controllers
var dashboardControllerFactory = require("sailfish/controller/dashboard"),
    settingsControllerFactory = require("sailfish/controller/settings"),
    projectViewControllerFactory = require("sailfish/controller/project_view"),
    projectBuildControllerFactory = require("sailfish/controller/project_build"),
    addRepositoryControllerFactory = require("sailfish/controller/add_repository"),
    hooksControllerFactory = require("sailfish/controller/hooks"),
    repositoriesControllerFactory = require("sailfish/controller/repositories");

//Model injection
var models = require("sailfish/model/model")(configuration["mongo"], app);

//Managers
var keyGenerator = require("sailfish/ssh/key_generator")(configuration["ssh"]["bits"]),
    repositoryManager = require("sailfish/model/repository_manager")(models, keyGenerator);

app.set("repository.manager", repositoryManager);

//Static server and Template configuration
app.use('/static', express.static('public'));
app.set('views', './views');
app.set('view engine', 'html');
app.set("sailfish.configuration", configuration);

//Init runner attached to app
app.set("runners", []);

var sailfishCollector = new collectorClass(app);

app.engine('html', twig.__express);

//Body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

new settingsControllerFactory(app, sailfishCollector);
new dashboardControllerFactory(app, sailfishCollector);
new projectViewControllerFactory(app, sailfishCollector);
new projectBuildControllerFactory(app, sailfishCollector);
new addRepositoryControllerFactory(app, sailfishCollector);
new hooksControllerFactory(app);
new repositoriesControllerFactory(app, sailfishCollector);

var server = app.listen(configuration["port"], function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});

/*
 * Add socket IO (server already defined)
 */
var socketIOServer = require('sailfish/socket.io/server')(server, app);


