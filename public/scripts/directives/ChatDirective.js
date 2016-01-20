 (function(){
 	angular.module("rtc").directive('chat-users',["$rootScope", "socket", "$http",function($rootScope, socket, $http){
 		return {
 				template: "<div class='fat-ct-usr-wrap'><div class='fat-chat-usrs-header'>Chat</div><div class='fat-chat-userlist' data-ng-repeat='user in chat_userlist'>{{user.name}}</div><div class='fat-chat-user-search'><form ng-submit='search_user($event)'><input id='user_search' class='fat-chat-user-search form-control'></form></div></div>",
				restrict: "E",
				priority: 99,
				scope: {
					width: "@?",
					height: "@?",
					image: "@?",
					list_url: "@?",
		      	},
		    	link: function(scope, element, attributes) {
		    		$http.post(list_url)
					.then(
						function(response) {
							fill_chat_userlist(response);
						},
						function(response){
							console.log(error);
						}
					);

		    		var fill_chat_userlist = function(data){
		    			scope.chat_userlist = data;
		    		}		    				

		    		scope.search_user = function(event){
		    			var data;
		    			var input = jQuery(event.target).find('#user_search');
		    			data = {
		    				q : input.val(),
		    			}
		    			socket().emit('chat-user-search',data);
		    			socket().removeAllListeners("chat-user-search");
		    			socket().on('chat-user-search',function(data){
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
 				template: "<div style='width:{{width}}px;height:{{height}}px; position:fixed' class='fat-chat-wrapper'><div class='fat-chat-header' style='width:{{width}}px;height:{{headerHeight}}px;' ><h4>{{chat_username}}</h4><div class='pull-right'><span class='fat-chat-close'><i class='fa fa-times'></i><span></div></div><div class='fat-chat-viewer' style='width:{{width}}px;height:{{viewHeight}}px;'><div data-ng-repeat='chat in chat_list'><div class='{{chat.className}} fat-chat-message'>{{chat.text}}</div></div></div><div class='fat-chat-taker' style='width:{{width}}px;height:{{inputHeight}}px; bottom: 0;'><form ng-submit='chat_submit($event)'><input name='chat_input' id='chat_input' class='fat-chat-input form-control'></form></div></div>",
				restrict: "E",
				priority: 99,
				scope: {
					width: "@?",
					height: "@?",
					state: "@?",
					chat_username: "@?",
					inputHeight: "@",
					viewHeight: "@",
					headerHeight: "@",
		      	},
		    	link: function(scope, element, attributes) {
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
			    				user : scope.$parent.chat_username
			    			}
			    			socket().emit('chat',data);
			    			socket().removeAllListeners("chat");
			    			socket().on('chat',function(data){
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