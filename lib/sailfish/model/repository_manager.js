var slug = require("slug");
var ring = require("ring");
var _ = require("lodash");

var classRepositoryManager = ring.create({

    constructor: function(models, key_generator) {
        this.models = models;
        if(typeof(key_generator)!="undefined") this.key_generator = key_generator;
    },

    create: function(name, repository, branches, hosts, callback) {

        //Adding the project to database, and returning to settings
        var sshPair = this.key_generator.generate();
        var projectModel = this.models["model.Project"];
        var newProject = new projectModel({
            name: name,
            slug: slug(name),
            repository: repository,
            branches: branches,
            hosts: hosts,
            ssh_key: sshPair
        });
        newProject.save(function(err) {
            callback(err, newProject);
        });

    },

    exists: function(name, callback) {

        var projectModel = this.models["model.Project"];
        projectModel.find({name: name}, function(err, docs) {
            callback(!_.isEmpty(docs));
        });

    },

    read: function(name, callback) {
        var projectModel = this.models["model.Project"];
        projectModel.findOne({name: name}, function(err, doc) {
            callback(err, doc);
        });
    }

});

module.exports = function(models, key_generator) {
    return new classRepositoryManager(models, key_generator);
}