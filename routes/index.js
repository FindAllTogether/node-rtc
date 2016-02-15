'use strict';
var debug = require('debug')('routing:index');
var app = require('../app');
var listener = require('../listeners/index');
var errors = require('../middlewares/errors');
var route = require('../middlewares/route');

app.get('/', function(req, res) {    
    if(!req.xhr){
        res.render('base');
    }else{
        if(req.session && req.session.auth){
            var data = {
                link: "http://172.25.31.89:3000", // websocket server link
                user: req.session.user, // id of current user
                auth: true // authentication required
            };
            res.render('index', { data: data });
        }
        else
            res.render('auth')
    }  
});

app.post('/', function(req, res) {
    if(req.session && req.body.user && req.body.name){
        req.session.user = req.body.user;
        req.session.name = req.session.name;
        req.session.auth = true;
    }
    res.redirect('/');
});

app.get('/logout', function(req, res){
    req.session.auth = false;
    res.redirect('/');
});

app.get('/omegle', function(req, res) {
    var data = {
        link: "http://172.25.31.89:3000",
        auth: false // authentication not required
    };
    if(!req.xhr){
        res.render('base');
    }else{
        res.render('omegle', {data: data });
    }  
});

// when a new user is connected
app.io.sockets.on('connection', function (socket) {
    // socket listener object for current session
    var on = listener(socket, app.io);

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
        socket.on('chat_message',on.chat_receive);
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
