var assert = require("assert");
var model = require("sailfish/model/model");
var repositoryManagerFactory = require("sailfish/model/repository_manager");
var keyGeneratorFactory = require("sailfish/ssh/key_generator");
var _ = require("underscore");
var configuration = require("./../../../configuration_test.js");
var mongoStringConnection = configuration["mongo"];
var models = model(mongoStringConnection); //Model injection
var randomstring = require("randomstring");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/model/test_project_manager.js
 * @endcode
 */
describe("model project_manager", function() {

    it('create new repository on database, check existance and read', function(done) {

        var keyGenerator = new keyGeneratorFactory(1024);
        var repository_manager = repositoryManagerFactory(models, keyGenerator);

        var randomName = randomstring.generate(10);

        repository_manager.create(randomName, "ssh://fake.gitserver/repo", "", "", function(err, doc) {

            assert.equal(randomName, doc["name"]);
            assert.equal(randomName, doc["slug"]);
            assert.ok(!_.isEmpty(doc["_id"]));
            assert.equal("ssh://fake.gitserver/repo", doc["repository"]);
            assert.ok(_.isEmpty(doc["branches"]));
            assert.ok(_.isEmpty(doc["hosts"]));

            //SSH key check
            assert.ok(!_.isEmpty(doc["ssh_key"]));
            assert.ok(_.has(doc["ssh_key"], "public"));
            assert.ok(_.has(doc["ssh_key"], "private"));
            assert.ok(!_.isEmpty(doc["ssh_key"]["public"]));
            assert.ok(!_.isEmpty(doc["ssh_key"]["private"]));

            var publicSSHKey = doc["ssh_key"]["public"];
            var privateSSHKey = doc["ssh_key"]["private"];


            //check existance by name
            repository_manager.exists(randomName, function(existance){
                assert.ok(existance);

                //fetch
                repository_manager.read(randomName, function(err, doc){
                    assert.equal(randomName, doc["name"]);
                    assert.equal(randomName, doc["slug"]);
                    assert.ok(!_.isEmpty(doc["_id"]));
                    assert.equal("ssh://fake.gitserver/repo", doc["repository"]);
                    assert.ok(_.isEmpty(doc["branches"]));
                    assert.ok(_.isEmpty(doc["hosts"]));

                    assert.equal(publicSSHKey, doc["ssh_key"]["public"]);
                    assert.equal(privateSSHKey, doc["ssh_key"]["private"]);

                    done();
                });

            });

        });

    });

});