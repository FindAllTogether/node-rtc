'use strict';
var debug = require('debug')('routing:index');
var app = require('../app');
var listener = require('../listeners/index');
var errors = require('../middlewares/errors');
var route = require('../middlewares/route');

app.get('/', function(req, res) {
    var data = {
        link: "http://localhost:3000", // websocket server link
        user: '233453', // id of current user
        auth: true // authentication required
    };
    
    if(!req.xhr){
        res.render('base', { title: 'Find All Together', data: data });
    }else{
        res.render('index', { title: 'Find All Together', data: data });
    }  
});

app.get('/omegle', function(req, res) {
    var data = {
        link: "http://localhost:3000",
        auth: false // authentication not required
    };
    if(!req.xhr){
        res.render('base', { title: 'Find All Together', data: data });
    }else{
        res.render('omegle', { title: 'Find All Together', data: data });
    }  
});

// when a new user is connected
app.io.sockets.on('connection', function (socket) {
    // socket listener object for current session
    var on = listener(socket);

    // check the type of the request
    var handshaken = socket.store['store']['manager']['handshaken'];
    // multiple requests from same browser give multiple handshaken
    // the last handshaken of the dictionary is the handshaken of 
    // the current request.
    var keys = Object.keys(handshaken);
    var auth = handshaken[keys[keys.length-1]].query.auth;
    // if user requests for authentication
    if(auth != 'false'){
        // send acknowledgement to client
        socket.emit('connection');

        // identify the user
        socket.on('auth', on.auth);
        // on message sent
        socket.on('chat',on.chat_receive);
        // on call for acive user list
        socket.on('active-user-list', on.active);

    }else{
        // connect anonymous user
        socket.on('anonymous-request', on.anonymous_connect);

        // anonymous chat message
        socket.on('anonymous-message', on.anonymous_message);
    }

    // when connection disconnect
    socket.on('disconnect',on.disconnect);
});

Object.keys(errors).forEach(function(key){
  app.use(errors[key]);
});

module.exports = app;
