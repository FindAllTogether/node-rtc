app.controller('PageController',function(socket, desktopNotification, $scope){
	$scope.init = function(data){
		$scope.user = data.user;
		$scope.chat_username = '233453';
		socket = socket(data.link, data.user, desktopNotification);
	}	
});
