'use strict';
(function(){
 	angular.module("rtc").directive('chatusers',["$rootScope", "$http",function($rootScope, socket, $http){
 		return {
			template: "<div style='width: {{width}}px; height: {{ height }}px' class='fat-ct-usr-wrap'><div style='height:{{headerheight}}px' class='fat-chat-usrs-header'>Chat</div><div style='height:{{listheight}}px' class='fat-chat-userlist' data-ng-repeat='user in chat_userlist'>{{user}}</div><div class='fat-usr-srch-wrap' style='height:{{searchheight}}px'><form ng-submit='search_user($event)'><input id='user_search' class='fat-user-search form-control'></form></div></div>",
			restrict: "E",
			priority: 99,
			scope: {
				width: "@",
				height: "@",
				header: "@",
				headerheight: "@",
				listheight: "@",
				search: "@",
				searchheight: "@"
	      	},
	    	link: function(scope, element, attributes) {
	    		var socket = $rootScope.socket;
	    		socket.emit('active-user-list');
    			socket.removeAllListeners("active-user-list");
    			socket.on('active-user-list',function(data){
    				console.log(data);
    				fill_chat_userlist(data);
    			});

	    		var fill_chat_userlist = function(data){
	    			scope.chat_userlist = data;
	    		}		    				

	    		scope.search_user = function(event){
	    			var data;
	    			var input = jQuery(event.target).find('#user_search');
	    			data = {
	    				q : input.val(),
	    			}
	    			socket.emit('chat-user-search',data);
	    			socket.removeAllListeners("chat-user-search");
	    			socket.on('chat-user-search',function(data){
	    				fill_chat_userlist(data);
	    			});
	    			return false;
	    		}
	    	}
 		}
 	}]);
}).call(this);

(function(){
 	angular.module("rtc").directive('chat',["$rootScope", "socket",function($rootScope, socket){
 		return {
			template: "<div style='width:{{width}}px;height:{{height}}px; position:fixed' class='fat-chat-wrapper'><div class='fat-chat-header' style='width:{{width}}px;height:{{headerheight}}px;' ><h4>{{chatusername}}</h4><div class='pull-right'><span class='fat-chat-close'><i class='fa fa-times'></i><span></div></div><div class='fat-chat-viewer' style='width:{{width}}px;height:{{viewheight}}px;'><div data-ng-repeat='chat in chat_list'><div class='{{chat.className}} fat-chat-message'>{{chat.text}}</div></div></div><div class='fat-chat-taker' style='width:{{width}}px;height:{{inputheight}}px; bottom: 0;'><form ng-submit='chat_submit($event)'><input name='chat_input' id='chat_input' class='fat-chat-input form-control'></form></div></div>",
			restrict: "E",
			priority: 99,
			scope: {
				width: "@",
				height: "@",
				state: "@",
				chatusername: "@",
				inputheight: "@",
				viewheight: "@",
				headerheight: "@"
	      	},
	    	link: function(scope, element, attributes) {
	    		var socket = $rootScope.socket;
	    		scope.chat_list = [];

	    		function add_message(val, className){
	    			if(!val || val.trim()==''){
	    				return false;
	    			}
	    			var view = jQuery(element).find('.fat-chat-viewer');
	    			var div = {
	    				text: val,
	    				className:className?'fat-chat-msg-in':'fat-chat-msg-out'
	    			}
	    			scope.chat_list.push(div);
	    			view.scrollTop(view[0].scrollHeight);
	    			return true;
	    		}

	    		scope.chat_submit = function(event){
	    			var data;
	    			var input = jQuery(event.target).find('#chat_input');
	    			if(add_message(input.val(), false)){
	    				data = {
		    				message : input.val(),
		    				user : scope.chatusername
		    			}
		    			socket.emit('chat',data);
		    			socket.removeAllListeners("chat");
		    			socket.on('chat',function(data){
		    				add_message(data.message, true)
		    			});
		    			input.val('');							
	    			}		   
	    			return false; 			
	    		}
	    	}
 		}
 	}]);
}).call(this);

(function(){
 	angular.module("rtc").directive('omegle',["$rootScope", "socket",function($rootScope, socket){
 		return {
			template: "<div style='width:{{width}};height:{{height}};' class='fat-omegle'><div class='fat-msg-body' style='width:{{width}};height:{{viewheight}};'><div data-ng-repeat='chat in chat_list'><div class='{{chat.className}} fat-chat-message'><span class='{{chat.whoClass}}'><strong>{{chat.who}}: </strong></span>{{chat.text}}</div></div></div><div class='fat-bottom' style='width:{{width}};height:{{bottomheight}};'><button class='fat-toggle-btn' id='fat-toggle-btn'>New</button><form><textarea rows='3' name='chat_input' disabled='disabled' id='chat_input' class='fat-mgs-input form-control' ng-keypress='chat_submit($event)'></textarea></form></div></div>",
			restrict: "E",
			priority: 99,
			scope: {
				width: "@",
				height: "@",
				viewheight: "@",
				bottomheight: "@"
	      	},
	    	link: function(scope, element, attributes) {
	    		var socket;
	    		scope.chat_list = [];

	    		// For connecting
	    		jQuery('#fat-toggle-btn').click(connect);						

	    		// connect to random chat
	    		function connect(){
	    			// initialize
	    			update_text('Connecting');
	    			scope.chat_list = [];
					socket = $rootScope.socketInit();
					socket.emit('anonymous-request');

					// on connect
					socket.on('connected',function(){
						jQuery('#chat_input').prop('disabled', false);
						// continue chat
						continue_chat();

						// on new message
						socket.on('message', function(data){
							add_message(data.message, true);
						});

						// on disconnect
						socket.on('disconnect', function(){
							disconnect();
							update_text('New');
							jQuery('#fat-toggle-btn').click(connect);
						});
					});
				}

				// update button text
				function update_text(text){
					jQuery('#fat-toggle-btn').html(text);
					jQuery('#fat-toggle-btn').off('click');
				}
	    		
				// add a message in chat body
	    		function add_message(val, className){
	    			if(!val || val.trim()==''){
	    				return false;
	    			}
	    			var view = jQuery('.fat-msg-body');
	    			var div = {
	    				who: className? 'Stranger':'You',
	    				whoClass: className? 'fat-red':'fat-black',
	    				text: val,
	    				className:'fat-chat-msg'
	    			}
	    			scope.chat_list.push(div);
	    			setTimeout(function(){
					    view.scrollTop(view[0].scrollHeight);
					}, 10);
	    			return true;
	    		}

	    		// on sending a message
	    		scope.chat_submit = function(event){
	    			// return if no user is connected
	    			if(!socket) return;

	    			if(event.which == 13){
	    				var data;
		    			var input = jQuery('#chat_input');
		    			if(add_message(input.val(), false)){
		    				data = {
			    				message : input.val()
			    			}
			    			socket.emit('anonymous-message',data);
			    			setTimeout(function(){
							    input.val('');
							}, 10);							
		    			}		   
		    			return false; 
	    			}else{
	    				continue_chat();
	    			}    						
	    		}

	    		// keep chat continue
	    		function continue_chat(){
	    			update_text('Stop');

					// try to disconnecting chat
					jQuery('#fat-toggle-btn').click(function(){
						update_text('Really');

						// disconnect chat
						jQuery('#fat-toggle-btn').click(function(){
							socket.disconnect();
							disconnect();
							update_text('New');
							jQuery('#fat-toggle-btn').click(function(){
								update_text('connecting');
								connect();
							});
						});
					});
	    		}

	    		// Disconnect
	    		function disconnect(){
	    			socket = null;
	    			jQuery('#chat_input').val('');
	    			jQuery('#chat_input').prop('disabled', true);
	    		}
	    	}
 		}
 	}]);
}).call(this);