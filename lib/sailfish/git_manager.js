var ring = require("ring");
var request = require("request");
var wildcard = require("wildcard");
var _ = require("underscore");

var gitManagerClass = ring.create({

    constructor: function(app) {
        this.app = app;
    },

    _getWatchedBranches: function(branches, projectDoc) {
        //Extract watched branches information
        var preparedBranches = this.prepareBranchesForView(branches, projectDoc);
        var watchedBranches = [];
        _.each(preparedBranches, function(prepBranch) {
            if(prepBranch.watched) watchedBranches.push(prepBranch.branch);
        });

        return watchedBranches;
    },

    latestWatchedCommits: function(branches, commits, projectDoc) {
        var watchedBranches = this._getWatchedBranches(branches, projectDoc);
        var latestCommitsPerBranch = {};
        _.each(watchedBranches, function(branchWatched) {
            if(_.has(commits, branchWatched) && !_.isEmpty(commits[branchWatched])) {
                latestCommitsPerBranch[branchWatched] = commits[branchWatched][0]["commit"];
            }
        });

        return latestCommitsPerBranch;
    },

    prepareBranchesForView: function(branches, projectDoc) {
        var docBranches = projectDoc.branches.split(",");
        var branchesWatchedArray = [];

        _.each(branches, function(branchFromGit) {
            _.each(docBranches, function(branchFromConfig) {
                if(wildcard(branchFromConfig, branchFromGit) || (branchFromConfig==branchFromGit)) {
                    branchesWatchedArray.push(branchFromGit);
                }
            });
        });

        //Remove duplicated elements
        branchesWatchedArray = _.uniq(branchesWatchedArray);

        //Prepare the output object
        var output = [];

        //Remove the watched branches from the original object and add the output item
        _.each(branchesWatchedArray, function(branchWatched) {
            branches = _.without(branches, branchWatched);
            output.push({
                branch: branchWatched,
                watched: true
            });
        });

        _.each(branches, function(branchNonWatched) {
            output.push({
                branch: branchNonWatched,
                watched: false
            });
        });

        return output;
    },

    prepareCommitsForView: function(branches, commits, projectDoc, callback, limit) {

        if(typeof(limit)=="undefined") limit = 20; //Max commit limmit control by branch

        //Remove non-watched commits
        var watchedBranches = this._getWatchedBranches(branches, projectDoc);
        var watchedCommits = {};
        var pluckedCommits = {};
        _.each(watchedBranches, function(branchWatched) {
            if(_.has(commits, branchWatched)) {
                watchedCommits[branchWatched] = commits[branchWatched];

                //Reduce size to limit
                if(_.size(watchedCommits[branchWatched])>limit) {
                    watchedCommits[branchWatched] = watchedCommits[branchWatched].slice(0, limit-1);
                }

                pluckedCommits[branchWatched] = _.pluck(watchedCommits[branchWatched], "commit");
            }
        });

        var preparedCommitsForView = {};

        this.app.get("model.Build").find({"project": projectDoc.name}).limit(limit*(branches.length))
                .sort('-datetime').exec(function(err, builds) {

            var findInBuilds = function(commit) {
                var returnSeq = null;
                _.each(builds, function(build) {
                    if((build.commit==commit) && _.isNull(returnSeq)) {
                        returnSeq = build.sequence;
                    }
                });
                return returnSeq;
            };

            var pluckedBuiltCommits = _.pluck(builds, "commit");
            _.each(watchedBranches, function(branchWatched) {
                preparedCommitsForView[branchWatched] = [];

                _.each(commits[branchWatched], function(realCommit) {
                    var buildSequence = findInBuilds(realCommit["commit"]);
                    var preparedCommitInfo = _.extend(realCommit, {
                        "built": _.contains(pluckedBuiltCommits, realCommit["commit"]),
                        "sequence": (_.isNull(buildSequence)) ? null : buildSequence
                    });
                    preparedCommitsForView[branchWatched].push(preparedCommitInfo);
                });
            });

            callback(preparedCommitsForView);

        });
    }

});

module.exports = function(app) {
    return new gitManagerClass(app);
};