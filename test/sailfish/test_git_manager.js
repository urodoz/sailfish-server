var assert = require("assert"),
    gitManagerFactory = require("sailfish/git_manager"),
    _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/sailfish/test_git_manager.js
 * @endcode
 */
describe("git manager", function() {

    it('prepare branches for view: single branch, no wildcards', function(done) {

        var fakeApp = {};
        var gitManager = gitManagerFactory(fakeApp);

        var preparedObject = gitManager.prepareBranchesForView(["master"], {branches: "master"});

        assert.ok(_.isArray(preparedObject));
        assert.equal(1, preparedObject.length);
        assert.equal("master", preparedObject[0]["branch"]);
        assert.equal(true, preparedObject[0]["watched"]);

        done();
    });

    it('prepare branches for view: single branch, no wildcards, no track', function(done) {

        var fakeApp = {};
        var gitManager = gitManagerFactory(fakeApp);

        var preparedObject = gitManager.prepareBranchesForView(["master"], {branches: "develop"});

        assert.ok(_.isArray(preparedObject));
        assert.equal(1, preparedObject.length);
        assert.equal("master", preparedObject[0]["branch"]);
        assert.equal(false, preparedObject[0]["watched"]);

        done();
    });

    xit('prepare branches for view: single branch, wildcards', function(done) {

        var fakeApp = {};
        var gitManager = gitManagerFactory(fakeApp);

        var preparedObject = gitManager.prepareBranchesForView(["master", "develop"], {branches: "mast*"});

        assert.ok(_.isArray(preparedObject));
        assert.equal(2, preparedObject.length);
        assert.equal("master", preparedObject[0]["branch"]);
        assert.equal(true, preparedObject[0]["watched"]);

        //FIXME: wildcard library not workin as expected

        done();
    });

    it('watched branches method: single branch, no wildcards', function(done) {

        var fakeApp = {};
        var gitManager = gitManagerFactory(fakeApp);

        var watchedBranches = gitManager._getWatchedBranches(["master"], {branches: "master"});

        assert.ok(_.isArray(watchedBranches));
        assert.equal(1, watchedBranches.length);
        assert.equal("master", watchedBranches[0]);

        done();
    });

    it('watched branches method: multiple branches, no wildcards', function(done) {

        var fakeApp = {};
        var gitManager = gitManagerFactory(fakeApp);

        var watchedBranches = gitManager._getWatchedBranches(["master", "develop", "testing", "experimental"], {branches: "master"});

        assert.ok(_.isArray(watchedBranches));
        assert.equal(1, watchedBranches.length);
        assert.equal("master", watchedBranches[0]);

        done();
    });

});