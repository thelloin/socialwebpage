'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('app', ['ngResource', 'ngRoute', 'mm.foundation'])
    .config(function($routeProvider, $locationProvider, $httpProvider) {
	
	//================================================
	// Check if the user is connected
	//================================================
	
	var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
	    // Initialize a new promise
	    var deferred = $q.defer();

	    // Make an AJAX call to check if the user is logged in
	    $http.get('/loggedin').success(function(user){
		// Authenticated

		if (user !== '0') {
		    $rootScope.currentUser = { username: user.local.username, firstname: user.firstName, lastname: user.lastName, id: user._id};
		    $rootScope.friends = user.friends;
		    deferred.resolve();
		}
		// Not Authenticated
		else {
		    $rootScope.message = 'You need to log in.';
		    deferred.reject();
		    $location.url('/login');
		}
	    });

	    return deferred.promise;
	};
	//================================================
	
	//================================================
	// Add an interceptor for AJAX errors
	//================================================
	$httpProvider.interceptors.push(function($q, $location) {
	    return {
		response: function(response) {
		    // do something on success
		    return response;
		},
		responseError: function(response) {
		    if (response.status === 401)
			$location.url('/login');
		    return $q.reject(response);
		}
	    };
	});

	//================================================
	// Define all the routes
	//================================================
	$routeProvider
	    .when('/', {
		templateUrl: '/views/home.html',
		controller: 'HomeCtrl',
		resolve: {
		    loggedin: checkLoggedin
		}

	    })
	    .when('/home', {
		templateUrl: 'views/home.html',
		controller: 'HomeCtrl',
		resolve: {
		    loggedin: checkLoggedin
		}

	    })
	    .when('/user', {
		templateUrl: 'views/home.html',
		controller: 'UserCtrl',
		resolve: {
		    loggedin: checkLoggedin
		}
	    })
	
	    .when('/login', {
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl',

	    })
            .when('/register', {
		templateUrl: 'views/register.html',
		controller: 'RegCtrl'
	    })
	    .otherwise({
		redirectTo: '/login'
	    });
	//================================================

    }) // end of config()

    .run(function($rootScope, $http){
	$rootScope.message = '';
	//$rootScope.currentUser = $rootScope.setUser;
	$rootScope.chats = [];
	// Logout function is available in any pages
	$rootScope.logout = function(){
	    $rootScope.message = 'Logged out.';
	    $http.post('/logout');
	    
	};
    });

app.directive('resize', function ($window) {
    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': window.innerHeight, 
                'w': window.innerWidth
            };
        }, function (newValue, oldValue) {
            console.log(newValue, oldValue);
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.resizeWithOffset = function (offsetH) {
                scope.$eval(attr.notifier);
                return { 
                    'height': (newValue.h - offsetH) + 'px'                    
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
}); 

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);


app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
	    
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
	    
	    
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
			//alert(callback);
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});


/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
    // This object will be filled by the form
    $scope.user = {};

    // Register the login() function
    $scope.login = function(){
	$http.post('/login', {
	    username: $scope.user.username,
	    password: $scope.user.password,
	})
	    .success(function(user){
		// No error: authentication OK
		$rootScope.message = 'Authentication successful!';
		$location.url('/home');
	    })
	    .error(function(){
		// Error: authentication failed
		$rootScope.message = "Authentication failed!";
      		$location.path('/login');
	    });
    };
});

/**********************************************************************
 * Register controller
 **********************************************************************/
app.controller('RegCtrl', function($scope, $rootScope, $http, $location) {
    // This object will be filled by the form
    $scope.user = {};

    $scope.register = function(){
	$http.post('/register', {
	    username: $scope.user.username,
	    password: $scope.user.password,
	    firstname: $scope.user.firstName,
	    lastname: $scope.user.lastName
	})
	    .success(function(user){
		$rootScope.message = 'Authentication successful!';
		$location.url('/home');
	    })
	    .error(function(){
		$rootScope.message = 'Registration failed.';
		$location.path('/register');
		
	    });
    };
});


/**********************************************************************
 * Home controller
 **********************************************************************/
app.controller('HomeCtrl', function($scope, $rootScope, $http) {

    $scope.notifyServiceOnChage = function(){
	console.log($scope.windowHeight);
    };
   
    $scope.atPost = 1;
   $scope.changeView = function(setter) {
	$scope.atPost = setter;
    };


    $scope.searchText;
    $scope.search = false;

    $scope.getResults = function() {
	$scope.findUsers($scope.searchText);

    };

    $scope.findUsers = function(sValue) {
	var result;
	$scope.users.forEach(function(obj, i){
	    $scope.search = true;
	    if(obj.name == sValue){
		$scope.searchResult = obj;
	    }
	});
    };

    $scope.startChat = function(userid, uname) {
	$rootScope.chats.push({ messages: [], ownid: $rootScope.currentUser.id, otherid: userid, name: uname });
	
    };
    
    $scope.users = [];
    $scope.home = true;

    
    $http({
	url: '/friends',
	method: 'GET',
    }).success(function(friends){
	$scope.friends = friends;
    });

    // Fill the array to display it in the page
    $http.get('/users').success(function(users){
	for (var i in users)
	    $scope.users.push(users[i]);
    });

    
});

/**********************************************************************
 * User controller
 **********************************************************************/
app.controller('UserCtrl', function($scope, $rootScope, $http, $routeParams, $timeout) {

    $scope.atPost = 1;
    
    $scope.changeView = function(setter) {
	$scope.atPost = setter;
    };

    $scope.startChat = function(userid, name) {
	alert("Chat is only availible on your home page");
    };
    
    $scope.addFriend = function(){	
	$http.post('/addfriend', {
	    userIdToAdd: $routeParams.userid,
	    nameToAdd: $scope.Userinfo[0]
	})
	    .success(function(friends){
		$scope.friends = friends;
		$scope.notFriend = false;		
	    })
	    .error(function(){
		console.log("Error adding friend");
	    });
    };
    
    $scope.Userinfo = [];
    $http({
	url: '/userinfo/',
	method: 'GET',
	params: {userid: $routeParams.userid}
    }).success(function(info){
	$scope.Userinfo = info;
	$scope.visitPage = $scope.Userinfo[0];
    });

    $http({
	url: '/friends',
	method: 'GET',
    }).success(function(friends){
	$scope.notFriend = true;
	$scope.friends = friends;
	$scope.friends.forEach(function(friend, i){
	    if(friend.userid == $routeParams.userid){
		$scope.notFriend = false;
	    }
	});
    });

    $scope.users = [];
    $scope.home = false;

    $http.get('/users').success(function(users){
	for (var i in users)
	    $scope.users.push(users[i]);
    });
    
});


app.controller('ChatCtrl', function($scope, $rootScope, $timeout, socket) {

    socket.on('init', function (data) {

	$scope.name = data.name;
	$scope.chatusers = data.users;
    });

    socket.on('send:message', function (message) {

	if(message.sender == $rootScope.currentUser.id){
	    $rootScope.chats.forEach(function(obj, i){
		if(obj.otherid == message.reciever) {
		    obj.messages.push(message);
		}
	    });
	}

	if(message.reciever == $rootScope.currentUser.id) {

	    $rootScope.chats.forEach(function(obj, i){
		if(obj.otherid == message.sender) {

		    obj.messages.push(message);
		}
	    });
	}
    });

    $scope.message = {text: ""}
    
    $scope.messages = [];

    $scope.sendMessage = function(recieveId) {
	var messageText = $scope.message.text;

	socket.emit('send:message', {
	    user: $rootScope.currentUser.id,
	    reciever: recieveId,
	    message: $rootScope.currentUser.firstname + " said: " + messageText
	});

	$scope.message.text = '';
    };
    
    $scope.chatPopover = "fName said";
    $scope.chatTitle = "fName lName";

});

app.controller('PostCtrl', function($scope, $http, $routeParams) {
 
    $scope.newPost = false;
    $scope.writePost = function(){
	if($scope.newPost === false) {
	    $scope.newPost = true;
	} else {
	    $scope.newPost = false;
	}
    };

    $scope.posttext;
    
    $scope.sendPost = function(){
	$http.post('/newpost', {
	    userToRecieve: $routeParams.userid,
	    text: $scope.posttext
	})
	    .success(function(posts){
		$scope.newPost = false;
		$scope.posts.push(posts);
	    })
	    .error(function(){
		console.log("There was an error posting the post");
	    });
    };

    $http({
	url: '/posts',
	method: 'GET',
	params: {userid: $routeParams.userid}
    }).success(function(posts){
	$scope.posts = posts;
    });
});

app.controller('ImageCtrl', function($q, $rootScope, $scope, $http, $routeParams) {
 
    $scope.newImage = false;
    $scope.uploadImage = function(){
	if($scope.newImage === false) {
	    $scope.newImage = true;
	} else {
	    $scope.newImage = false;
	}
    };

    $scope.worker = new Worker('javascripts/worker.js');

    var latest;
    var theUser = $routeParams.userid;
    
    $scope.getImages = function(){
	$http({
	    url: '/images',
	    method: 'GET',
	    params: {userid: $routeParams.userid}
	}).success(function(images){
	    $scope.images = images;
	    
	    if(images.length)
		latest = (images.slice(-1)[0]).split("/")[3];
	    else
		latest = 0;

	    if (theUser != undefined) {
		$scope.worker.postMessage([latest, theUser]);
	    } else {
		$scope.worker.postMessage(latest);
	    }
	    
	}).error(function(err) {
	    console.log("Error while getting messages");
	}); 
    }
    $scope.getImages();


    $scope.worker.onmessage = function(event) {
	$scope.getImages();
    };
  
    $scope.sendImage = function(files){

	var fd = new FormData();
	fd.append("file", files);

	$http.post('/upload', fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
	})        
	    .success(function(){
		console.log("Succces uploading image");
		//Here we could have used a socket call for telling
		//users viewing this page that something happend.	
            })
            .error(function(){
		console.log("Error uploading image");
            });
    };
});





