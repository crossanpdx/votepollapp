angular.module('PollVotingApp', ['ngRoute'])

// app routes
.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
    templateUrl: '/public/app/views/home.html'
    })
    // logged in routes
    .when('/polls', {
    templateUrl: '/public/app/views/user_polls.html',
    controller: 'PollsController'
    })
    .when('/profile', {
    templateUrl: '/public/app/views/user_profile.html',
    controller: 'ProfileController'
    })
    .when('/poll/:num', {
    templateUrl: '/public/app/views/user_poll.html',
    controller: 'User_PollController'
    })
    .when('/add/poll', {
    templateUrl: '/public/app/views/user_addpoll.html',
    controller: 'User_AddPollController'
    })
    .when('/polls/my', {
    templateUrl: '/public/app/views/user_mypolls.html',
    controller: 'User_MyPollsController'
    })
    .when('/delete/confirm', {
    templateUrl: '/public/app/views/user_polldeleted.html'
    })
    // default
    .otherwise({ 
      redirectTo: '/' 
    }); 

});