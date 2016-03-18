// pulls in all poll data (multiple polls)
angular.module('PollVotingApp')
.controller('PollsController', ['$scope', 'polls', function($scope, polls) {
  $scope.loading = true;
  polls.getPolls().success(function(data) {
    $scope.loading = false;
    $scope.polls = data;
    $scope.titleLength = function(title) {
      if (title.length > 40) {
        return title.slice(0, 37) + "...";
      } else {
        return title;
      }
    };
  });  
}]);