var slug = require("slug"),
    _ = require("lodash");

var classRepositoryManager = function(models, key_generator) {

    var projectModel = models["model.Project"];

    this.create = function(name, repository, branches, hosts, callback) {

        //Adding the project to database, and returning to settings
        key_generator.generate(function(sshPair) {

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

        });
    };

    this.exists = function(name, callback) {
        projectModel.find({name: name}, function(err, docs) {
            callback(!_.isEmpty(docs));
        });

    };

    this.read = function(name, callback) {
        projectModel.findOne({name: name}, function(err, doc) {
            callback(err, doc);
        });
    };

    this.readBySlug = function(slug, callback) {
        projectModel.findOne({slug: slug}, function(err, doc) {
            callback(err, doc);
        });
    };

};

module.exports = function(models, key_generator) {
    return new classRepositoryManager(models, key_generator);
};