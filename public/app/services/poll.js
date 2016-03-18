angular.module('PollVotingApp')
.factory('poll', ['$http', function($http) {
  // get the poll data
  this.getPoll = function(pollNum) {
    return $http.get('/api/poll/' + pollNum)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // add a poll vote for new voter
  this.addPollVote = function(pollNum, option) {
    return $http.get('/api/newvote/' + pollNum + "/" + option)
              .success(function(data) {
                return "Your vote for " + option + " has been submitted.";
              })
              .error(function(err) {
                return err;
              });
  };
  return this;
}]);
