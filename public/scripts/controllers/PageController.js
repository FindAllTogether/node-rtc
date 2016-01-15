app.controller('PageController',function(socket, $scope){
	$scope.init = function(data){
		socket(data.link, data.user, function(data){});
	}	
});
