'use strict';
app.controller('ChatController', function (socket, desktopNotification, $scope, $rootScope) {
	$scope.chat_username = '233453';
	$scope.init = function(data){
		$scope.user = data.user;
		$rootScope.username = data.user;
		$rootScope.socket = socket(data.link, desktopNotification, true);

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
	};
});

app.controller('OmegleController', function (socket, $scope, $rootScope) {
	$scope.init = function(data){
		$rootScope.socketInit = function(){
			if($rootScope.socket){
				$rootScope.socket.disconnect();
			}
			return socket(data.link, null, false);
		}
	};
});