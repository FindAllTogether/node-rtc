'use strict';
(function(){
 	angular.module("rtc").directive('chatusers',["$rootScope","socket", "$http", "$compile",function($rootScope, socket, $http, $compile){
 		return {
			template: "<div style='width: {{width}}px; height: {{ height }}px' class='fat-ct-usr-wrap'><div style='height:{{headerheight}}px' class='fat-chat-usrs-header'>Chat</div><div style='height:{{listheight}}px' class='fat-chat-userlist'><ul data-ng-repeat='user in chat_userlist'><li ng-if='myusername!=user' data-id='{{user}}'>{{user}}</li></ul></div><div class='fat-usr-srch-wrap' style='height:{{searchheight}}px'><form ng-submit='search_user($event)'><input id='user_search' class='fat-user-search form-control'></form></div></div>",
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
	    		scope.myusername = $rootScope.username;
	    		// 8 states
    			// initial state => final state, position
    			$rootScope.stateTransition = {
    				'0' : ['1',1],
    				'1' : ['3',2],
    				'2' : ['3',1],
    				'3' : ['7',4],
    				'4' : ['5',1],
    				'5' : ['7',2],
    				'6' : ['7',1],
    				'7' : ['7',4],
    			};

	    		// initialise state
	    		$rootScope.chatState = 0;

	    		socket.emit('active-user-list');
    			socket.removeAllListeners("active-user-list");
    			socket.on('active-user-list',function(data){
    				fill_chat_userlist(data);
    			});

	    		var fill_chat_userlist = function(data){
	    			scope.chat_userlist = data.users;
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

	    		jQuery('.fat-chat-userlist').click(function(event){	
	    			var state, hiddenElement, right, div;  
	    			// to fix wrong clicks
	    			if(!event.target.dataset.id){
	    				return;
	    			}
	    			hiddenElement = jQuery('chat[chatusername="'+event.target.dataset.id+'"');
	    			
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
						div = '<chat state='+state+' chatusername="'+event.target.dataset.id+'" width="250" height="300" inputheight="24" headerheight="25" viewheight="251" right='+right+'></chat>';
		    			jQuery("body").append(
						  $compile(div)(scope)
						);	
					}else{
						hiddenElement.show();
						hiddenElement.attr('right',right);
						hiddenElement.attr('state',state);
						hiddenElement.find('.fat-chat-wrapper').css('right',right);
					}
									
	    		});
	    	}
 		}
 	}]);
}).call(this);

(function(){
 	angular.module("rtc").directive('chat',["$rootScope", "socket",function($rootScope, socket){
 		return {
			template: "<div style='width:{{width}}px;height:{{height}}px; position:fixed; right:{{right}}' class='fat-chat-wrapper'><div class='fat-chat-header' style='width:{{width}}px;height:{{headerheight}}px;' ><h4>{{chatusername}}</h4><div class='pull-right'><span class='fat-chat-close' ng-click='close_it()'><i class='fa fa-times'></i><span></div></div><div class='fat-chat-viewer' style='width:{{width}}px;height:{{viewheight}}px;'><div data-ng-repeat='chat in chat_list'><div class='{{chat.className}} fat-chat-message'>{{chat.text}}</div></div></div><div class='fat-chat-taker' style='width:{{width}}px;height:{{inputheight}}px; bottom: 0;'><form ng-submit='chat_submit($event)'><input name='chat_input' id='chat_input' class='fat-chat-input form-control'></form></div></div>",
			restrict: "E",
			priority: 99,
			scope: {
				width: "@",
				height: "@",
				state: "@",
				chatusername: "@",
				inputheight: "@",
				viewheight: "@",
				right: "@",
				headerheight: "@"
	      	},
	    	link: function(scope, element, attributes) {
	    		var socket = $rootScope.socket;
	    		scope.chat_list = [];

	    		socket.on('chat_message',function(data){
    				if(data.from == scope.chatusername){
    					add_message(data.message, true);
    				}		    				
    			});

	    		function add_message(val, className){
	    			if(!val || val.trim()==''){
	    				return false;
	    			}
	    			var view = jQuery(element).find('.fat-chat-viewer');
	    			var div = {
	    				text: val,
	    				className:className?'fat-chat-msg-out':'fat-chat-msg-in'
	    			}
	    			scope.chat_list.push(div);
	    			setTimeout(function(){
					    view.scrollTop(view[0].scrollHeight);
					}, 10);
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
		    			socket.emit('chat_message',data);		    			
		    			input.val('');							
	    			}		   
	    			return false; 			
	    		}

	    		scope.close_it = function(){
	    			var temp = Number($rootScope.chatState)-Number(scope.state);
	    			$rootScope.chatState = (temp<8 && temp>-1)?temp.toString():'0';
	    			jQuery(element).hide();
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

	    		scope.$on('$destroy', function(event) {
				    socket.disconnect();
				    socket = null;
				});
	    	}
 		}
 	}]);
}).call(this);