var assert = require("chai").assert,
    repositoryManagerFactory = require("sailfish/model/repository_manager"),
    buildManagerClass = require("sailfish/model/build_manager"),
    keyGeneratorFactory = require("sailfish/ssh/key_generator"),
    _ = require("lodash"),
    configuration = require("./../../../configuration_test.js"),
    sinon = require("sinon"),
    mongoStringConnection = configuration["mongo"],
    models = require("sailfish/model/model")(mongoStringConnection), //Model injection
    randomstring = require("randomstring");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/model/test_managers.js
 * @endcode
 */
describe("model build_manager", function() {

    this.timeout(5000);

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

    it('create new repository and use manager to factory build entities', function(done) {

        var keyGenerator = new keyGeneratorFactory(1024);
        var repository_manager = repositoryManagerFactory(models, keyGenerator);

        var randomName = randomstring.generate(10);
        var randomCommit = randomstring.generate(12);

        repository_manager.create(randomName, "ssh://fake.gitserver/repo", "", "", function(err, doc) {

            var buildManager = buildManagerClass(models);

            buildManager.create(randomName, randomCommit, "", function(err, buildDoc) {

                //Asserting is the same project binded to build
                assert.equal(buildDoc.sequence, 1);
                assert.equal(buildDoc.commit, randomCommit);
                assert.equal(buildDoc.project, randomName);
                assert.equal(buildDoc.success, false);
                assert.equal(buildDoc.status, "created");

                //Check the next seq (should be 2)
                setTimeout(function(){

                    buildManager.getNextSequence(randomName, function(nextSeq) {
                        assert.equal(2, nextSeq);

                        //Make another build
                        buildManager.create(randomName, randomCommit, "", function(err, buildDoc2) {

                            assert.equal(buildDoc2.sequence, 2);
                            assert.notEqual(buildDoc2.token, buildDoc.token);

                            buildManager.getNextSequence(randomName, function(nextSeq) {
                                assert.equal(3, nextSeq);
                                done();
                            });

                        });

                    });

                }, 400);

            });

        });

    });

});