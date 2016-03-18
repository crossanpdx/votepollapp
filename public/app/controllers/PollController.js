var options = {
    segmentShowStroke : true,
    segmentStrokeColor : "#fff",
    segmentStrokeWidth : 6,
    percentageInnerCutout : 50, // This is 0 for Pie charts
  	animation : true,
    animationSteps : 100,
    animationEasing : "easeOutQuart",
    animateRotate : true,
    animateScale : false,
    responsive: true
};

var chartColors = [['#E74C3C', '#C0392B'], ['#3498DB', '#2980B9'], ['#E67E22', '#D35400'], ['#2ECC71', '#27AE60'], ['#34495E', '#2C3E50'], ['#F1C40F', '#F39C12'], ['#1ABC9C', '#16A085'], ['#9B59B6', '#8E44AD'], ['#ECF0F1', '#BDC3C7'], ['#95A5A6', '#7F8C8D'], ['#C0392B', '#E74C3C'], ['#2980B9', '#3498DB'], ['#D35400', '#E67E22'], ['#27AE60', '#2ECC71'], ['#2C3E50', '#34495E'], ['#F39C12', '#F1C40F'], ['#16A085', '#1ABC9C'], ['#8E44AD', '#9B59B6'], ['#BDC3C7', '#ECF0F1'], ['#7F8C8D', '#95A5A6']];

// THE CONTROLLER
// pulls in one poll data (by poll num)
angular.module('PollVotingApp')
.controller('PollController', ['$scope', '$routeParams', 'poll', function($scope, $routeParams, poll) {
  poll.getPoll($routeParams.num).success(function(data) {
    $scope.poll = data.poll;
    $scope.user = data.user;
    // set the chart data
    var chartData = [];
    for (var i = 0; i < data.poll.options.length; i++) { 
      chartData.push({ "value": data.poll.options[i].votes, "label": data.poll.options[i].option, "color": chartColors[i][0], "highlight": chartColors[i][1] });
    }
    // Put the data in the chart
    var ctx = document.getElementById("voteChart").getContext("2d");
    var pollVoteChart = new Chart(ctx).Pie(chartData, options);
    document.getElementById('voteChart-legend').innerHTML = pollVoteChart.generateLegend();
    // check if the user IP has previously voted
    $scope.voted = false;
    // value of selected item
    $scope.myVote = "";
    $scope.message = false;
    // ADD VOTE FUNCTION
    $scope.addVote = function() {
      // check if option has been selected
      if ($scope.myVote.option && !$scope.voted) {
        // update the chart client side
        for (var j = 0; j < chartData.length; j++) {
          if (chartData[j].label == $scope.myVote.option) {
            pollVoteChart.segments[j].value = chartData[j].value + 1;
            pollVoteChart.update();
            $scope.voted = true;
            $scope.message = 'Your vote for "' + $scope.myVote.option + '" has been submitted';
          }
        }
        // update the DB
        poll.addPollVote($routeParams.num, $scope.myVote.option);
      }
    };
    // CHECK IF VOTED BEFORE FUNCTION
    $scope.checkVote = function() {
      if ($scope.voted) {
        return true;
      } else {
        for (var k = 0; k < data.user.poll_votes.length; k++) {
          if (data.user.poll_votes[k] == data.poll.poll_id) {
            return true;
          }
        }
        return false;
      }
    };
  });  
}]);
