angular.module('PollVotingApp')
.factory('add', ['$http', '$location', function($http, $location) {
  // add the poll data
  this.addPoll = function(data) {
    return $http({
            method  : 'POST',
            url     : '/api/user/add/poll',
            data    : data, 
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
              .success(function(data) {
                $location.path('/poll/' + data.poll_id);
              })
              .error(function(data) {
                return data;
              });
  };
  return this;
}]);
