var express = require('express');
var app = express();
var configuration = require("./configuration.js");
var twig = require('twig');
var _ = require("underscore");
var mongoose = require('mongoose');
var slug = require('slug');
var collectorClass = require("sailfish/collector");
var request = require("request");
var fs = require("fs-extra");
var async = require("async");
var uuid = require("node-uuid");
var rest = require('restler');

//Controllers
var addRunnerControllerFactory = require("sailfish/controller/add_runner");
var dashboardControllerFactory = require("sailfish/controller/dashboard");
var settingsControllerFactory = require("sailfish/controller/settings");
var projectViewControllerFactory = require("sailfish/controller/project_view");
var projectBuildControllerFactory = require("sailfish/controller/project_build");
var addRepositoryControllerFactory = require("sailfish/controller/add_repository");
var hooksControllerFactory = require("sailfish/controller/hooks");
var repositoriesControllerFactory = require("sailfish/controller/repositories");

//Model injection
require("sailfish/model/model")(app, configuration["mongo"]);

//Static server and Template configuration
app.use('/static', express.static('public'));
app.set('views', './views');
app.set('view engine', 'html');
app.set("sailfish.configuration", configuration);

var sailfishCollector = new collectorClass(app);

app.engine('html', twig.__express);

//Body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

new settingsControllerFactory(app, sailfishCollector);
new addRunnerControllerFactory(app, sailfishCollector);
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