'use strict';
app.controller('ChatController', function ($scope, $rootScope) {
	$scope.chat_username = '233453';
	// send authentication	
	$rootScope.socket.on('connection', function (msg) {
		$rootScope.socket.emit('auth',{user:$rootScope.username});
		console.log('alerted '+$rootScope.username);
	});

	// For desktop notifications
	$rootScope.socket.on('listner',function(session){
		$rootScope.socket.on(session['sessionID'], function(ev, data){
			callback(data.data);
		});
	});
});

app.controller('OmegleController', function ($scope, $rootScope) {
	
});