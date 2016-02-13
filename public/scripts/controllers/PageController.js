app.controller('PageController',function(socket, desktopNotification, $scope, $rootScope){
	$scope.init = function(data){
		if(data.auth){
			$scope.user = data.user;
			$rootScope.username = data.user;
			$rootScope.socket = socket(data.link, desktopNotification);
		}else{
			$rootScope.socketInit = function(){
				if($rootScope.socket){
					$rootScope.socket.disconnect();
				}
				return socket(data.link, null, false);
			}			
		}
		
	}
});
