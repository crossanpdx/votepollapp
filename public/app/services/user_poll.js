angular.module('PollVotingApp')
.factory('poll', ['$http', '$location', function($http, $location) {
  // get the poll data
  this.getPoll = function(pollNum) {
    return $http.get('/api/user/poll/' + pollNum)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // add poll vote for registered user
  this.addPollVote = function(pollNum, option) {
    return $http.get('/api/user/vote/' + pollNum + "/" + option)
              .success(function(data) {
                return "Your vote for " + option + " has been submitted.";
              })
              .error(function(err) {
                return err;
              });
  };
  // add poll option for registered user
  this.addPollOption = function(pollNum, option) {
    return $http.get('/api/user/option/' + pollNum + "/" + option)
              .success(function(data) {
                return "Your vote for " + option + " has been submitted.";
              })
              .error(function(err) {
                return err;
              });
  };
  // delete the poll
  this.deletePoll = function(pollNum) {
    return $http.get('/api/user/delete/poll/' + pollNum)
              .success(function(data) {
                $location.path('/delete/confirm');
              })
              .error(function(err) {
                return err;
              });
  };
  return this;
}]);
