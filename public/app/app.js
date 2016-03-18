angular.module('PollVotingApp', ['ngRoute'])

// app routes
.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
    templateUrl: '/public/app/views/home.html'
    })
    .when('/polls', {
    templateUrl: '/public/app/views/polls.html',
    controller: 'PollsController'
    })
    .when('/poll/:num', {
    templateUrl: '/public/app/views/poll.html',
    controller: 'PollController'
    })
    .when('/login', {
    templateUrl: '/public/app/views/login.html'
    })
    // default
    .otherwise({ 
      redirectTo: '/' 
    }); 

});