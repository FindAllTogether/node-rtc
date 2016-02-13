'use strict';
var debug = require('debug')('routing:index');
var queue = require('../models/pending_queue');
var users = {};
var anonymous_users = [];

var listener = function(socket){
	var on = {
		// send active user list
		active: function(data){
			socket.emit('active-user-list', Object.keys(users));
		},

		// take data to send
		auth : 	function(data){
			// check user
			if(!data.user){
				socket.disconnect();
				return;
			}

			// Later authentication code will be inserted here

			// store data in socket
			socket.user = data.user;
			if(Object.keys(users).indexOf(data.user)>-1){
				if(users[data.user].indexOf(socket)>-1){
				  	// do not accept repeated id
				} else{
				  	users[data.user].push(socket);
				}
			} else{
				users[data.user] = [socket];								
			}

			// An event for sending notification
			socket.emit('listner',{'sessionID':socket.id});

			// send pending notifications
			queue.select({user:data.user},function(err, pending_notices){
				if(!err && pending_notices && pending_notices.length){
					pending_notices.forEach(function(notice){
						socket.emit(socket.id, { 'data': notice.data });
						// delete notification from database
						queue.remove(notice.id, function(e, r){
							console.log('notification removed');
						});
					});
				}
			});
		},

		// not in use
		// will be used for sending push notifications
		notification: function(req){
			var body = req.body;
			if(!body.data || !body.users){
				return false;
			}

			// all valid users
			var user_ids = body.users.split(',');
			user_ids.forEach(function(id){
				// if user is active
				if(Object.keys(users).indexOf(id) > -1){
					// for each device of the user
					users[id].forEach(function(user_socket){
						// emit data for the user
						user_socket.emit(user_socket.id,{'data':body.data});
					});
				} else{
					// if user is not active then save entry in database
					var pending = {
						user: id,
						data: body.data
					};
					queue.insert(pending,function(err, result){
						console.log('notification inserted');
					});
				}
			});
			return true;
		},

		// On receiving a new message
		chat_receive: function(data){
			if(!data.message || !data.user){
				return false;
			}

			var res_data = {
				'message': data.message,
				'type':'chat_message'
			}

			if(!data.room || data.room =='undefined'){
				var id = data.user;			
				// if user is active
				if(Object.keys(users).indexOf(id) > -1){
					// for each device of the user
					users[id].forEach(function(user_socket){
						// emit data for the user
						user_socket.emit('chat', res_data);
					});
				} else{
					// if user is not active then save entry in database
					var pending = {
						user: id,
						data: res_data
					};
					queue.insert(pending,function(err, result){
						console.log('notification inserted');
					});
				}
			}

			// for group chat
			if(data.room){
				socket.broadcast.to(room).emit('chat',res_data);
			}
			return true;
		},

		// on anonymous chat request
		anonymous_connect: function(data){
			var first = true;
			var user = null;
			if(anonymous_users.length>0){
				try{
					user = anonymous_users.pop();
					// for mutual exclusion
					if(user){
						first = false;
						user.chatWith = socket;
						socket.chatWith = user;
						user.emit('connected');
						socket.emit('connected');
					}
				}catch(e){}				
			}

			if(first){
				anonymous_users.push(socket);
			}
		},

		// on anonymous message
		anonymous_message: function(data){
			// return if no message
			if(!data.message) return;
			// if pair is available
			try{
				socket.chatWith.emit('message',data);
			}catch(e){
				socket.disconnect();
			}			
		},

		// uses socket of disconnected user
		disconnect: function() {
			var index;
			if(socket.auth){
				index = users[socket.user].indexOf(socket);
				if (index > -1) {
				    users[socket.user].splice(index, 1);			    
				}
				return;
			}

			// disconnect pair
			try{
				// remove socket from anonymous_users
				index = anonymous_users.indexOf(socket);
				if (index > -1) {
				    anonymous_users.splice(index, 1);			    
				}

				// disconnect pair
				socket.chatWith.disconnect();				
			}catch(e){
				// pair already disconnected 
				// or there was no pair, In case, of single user
			}
	    }
	}
	return on;
}

module.exports = listener;