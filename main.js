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

//Models
mongoose.connect(configuration["mongo"]);

var Runner = mongoose.model('Runner', {
    name: String,
    url: String,
    token: String
});

var Project = mongoose.model("Project", {
    name: String,
    slug: String,
    repository: String,
    branches: String,
    hosts: String
});

var Build = mongoose.model("Build", {
    token: String,
    sequence: Number,
    commit: String,
    project: String, //Project name
    output: String,
    datetime: { type: Date, default: Date.now },
    success: Boolean,
    hosts: String,
    status: String //created, pulling, provisioning, running, finished
});

//Static server and Template configuration
app.use('/static', express.static('public'));
app.set('views', './views');
app.set('view engine', 'html');
app.set("sailfish.configuration", configuration);

//Model injection on application
app.set("model.Runner", Runner);
app.set("model.Project", Project);
app.set("model.Build", Build);
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