var app = angular.module('rtc', [
'ngRoute',
'btford.socket-io',
]);
app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
	// mark all requests as xhr
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
	// use html5 history if available
	if(window.history && window.history.pushState){
	    $locationProvider.html5Mode(true);
	}

	$routeProvider
	// fetch chat
	.when("/", {
		templateUrl: "/", 
		controller: "ChatController"})
	.when("/omegle", {
		templateUrl: "/omegle", 
		controller: "OmegleController"})
	.otherwise("/404", {template: "error", controller: "ErrorController"});

}]);