var config = {
	auth_token : 'auth_token',
	gcm_authorization_key : 'gcm_authorization_key_provided_by_google',
	port: '3000',
	// database configuration
	db: require('rc')('notifications',{ // need not to change this line
			host: 'localhost', // host
			user : 'root', // username of mysql
			password : 'itsmine', // password of mysql user
			database: 'notifications', // database in mysql
			min : 1, // minimum number of connections
			max : 5 // maximum number of connections
		})
}

module.exports = config;