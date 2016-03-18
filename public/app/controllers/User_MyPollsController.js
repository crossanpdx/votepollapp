// pulls in user poll data (multiple polls by user as author)
angular.module('PollVotingApp')
.controller('User_MyPollsController', ['$scope', 'polls', function($scope, polls) {
  $scope.loading = true;
  polls.getMyPolls().success(function(data) {
    $scope.loading = false;
    $scope.polls = data;
    if (!$scope.polls[0]) {
        $scope.nopolls = true;
    }
    $scope.titleLength = function(title) {
      if (title.length > 40) {
        return title.slice(0, 37) + "...";
      } else {
        return title;
      }
    };
  });  
}]);