'use strict';
app.
factory('socket', function (socketFactory) {
	var socketObj = function(url, callback, auth){
		// open a connection
		var socket_connection = io.connect(url, { 'query': "auth="+auth, 'force new connection': true });
		var socket = socketFactory({
			ioSocket: socket_connection
		});

		return socket;
	}
	return socketObj;
});

app.
factory('openChatbox', function ($rootScope, $compile) {
	var chatbox = function(scope, username){
		var state, hiddenElement, right, div;  
		hiddenElement = jQuery('chat[chatusername="'+username+'"');
		
		// if already active tab
		if(hiddenElement.length != 0)
			if($(hiddenElement[0]).css("display") != 'none'){
			return;
		}
		if($rootScope.chatState == '7'){
			jQuery('chat[state="4"]').hide();
		}
		// position of chat box
		state = $rootScope.stateTransition[$rootScope.chatState][1];    			
		$rootScope.chatState = $rootScope.stateTransition[$rootScope.chatState][0];
		console.log('chatState '+$rootScope.chatState + ' state '+ state);					
		
		right = (state==1)?'250px':(state==2)?'510px':'770px';
		if(hiddenElement.length == 0){
			div = '<chat state='+state+' chatusername="'+username+'" width="250" height="300" inputheight="24" headerheight="25" viewheight="251" right='+right+'></chat>';
			jQuery("#fat-chat-container").append(
			  $compile(div)(scope)
			);	
		}else{
			hiddenElement.show();
			hiddenElement.attr('right',right);
			hiddenElement.attr('state',state);
			hiddenElement.find('.fat-chat-wrapper').css('right',right);
		}
	}
	return chatbox;
});

app.
factory('desktopNotification', function(){
	var notifyMe = function(data) {
		var user= data.user ,
			message = data.message;
		// Let's check if the browser supports notifications
		if (!("Notification" in window)) {
			alert("This browser does not support desktop notification");
		}
		// Let's check if the user is okay to get some notification
		else if (Notification.permission === "granted") {
			// If it's okay let's create a notification
			var options = {
				body: message,
				dir : "ltr"
			};
			var notification = new Notification(user + " Posted a comment",options);
		}
		// Otherwise, we need to ask the user for permission
		// Note, Chrome does not implement the permission static property
		// So we have to check for NOT 'denied' instead of 'default'
		else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
	  			// Whatever the user answers, we make sure we store the information
	  			if (!('permission' in Notification)) {
					Notification.permission = permission;
	  			}
	  			// If the user is okay, let's create a notification
	  			if (permission === "granted") {
					var options = {
						body: message,
						dir : "ltr"
					};
					var notification = new Notification(user + " Posted a comment",options);
	  			}
			});
		}
	}
	return notifyMe;
});