var debug = require('debug')('routing:index');
var app = require('../app');
var listener = require('../listeners/index');
var errors = require('../middlewares/errors');

app.get('/', function(req, res) {
    var data = {
        link: "http://localhost:3000",
        user: '233453'
    };
    res.render('index', { title: 'Find All Together', data: data });
});

// when a new user is connected
app.io.sockets.on('connection', function (socket) {
    // socket listener object for current session
    var on = listener(socket);
    // send acknowledgement to client
    socket.emit('connection');
    // identify the user
    socket.on('auth', on.auth);
    // when connection disconnect
    socket.on('disconnect',on.disconnect);
});

Object.keys(errors).forEach(function(key){
  app.use(errors[key]);
});

module.exports = app;
