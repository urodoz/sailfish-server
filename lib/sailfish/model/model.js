var ring = require("ring");
var mongoose = require("mongoose");

module.exports = function(app, mongoConnectionString) {
    //Models
    mongoose.connect(mongoConnectionString);

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

    //Model injection on application
    app.set("model.Runner", Runner);
    app.set("model.Project", Project);
    app.set("model.Build", Build);

};