var debug = require('debug')('routing:index');
var app = require('../app');
var listener = require('../listeners/index');
var errors = require('../middlewares/errors');

app.get('/', function(req, res) {
    var data = {
        link: "http://localhost:3000",
        user: '233453',
        auth: true
    };
    res.render('index', { title: 'Find All Together', data: data });
});

app.get('/omegle', function(req, res) {
    var data = {
        link: "http://localhost:3000",
        auth: false
    };
    res.render('omegle', { title: 'Find All Together', data: data });
});

// app.io.use(function(socket, next) {
//     socket.auth = socket.query['auth'];
//     next();
// });

// when a new user is connected
app.io.sockets.on('connection', function (socket) {
    // socket listener object for current session
    var on = listener(socket);
    var handshaken = socket.store['store']['manager']['handshaken'];
    var auth = handshaken[Object.keys(handshaken)[0]].query.auth;
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
