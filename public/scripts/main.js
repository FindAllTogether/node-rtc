var app = angular.module('rtc', [
'ngRoute',
'btford.socket-io',
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	$routeProvider
	// fetch chat
	.when("/", {
		template: "<chat>", 
		controller: "ChatController"})
	.otherwise("/404", {template: "error", controller: "ErrorController"});

	if(window.history && window.history.pushState){
	    $locationProvider.html5Mode(true);
	}
}]);