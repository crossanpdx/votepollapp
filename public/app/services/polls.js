angular.module('PollVotingApp')
.factory('polls', ['$http', function($http) {
  this.getPolls = function() {
    return $http.get('/api/polls')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  this.getMyPolls = function() {
    return $http.get('/api/user/polls')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  return this;
}]);