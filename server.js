// load express and create the app
var express = require('express');
var app = express();
var config = require('./config');
var path = require('path');

// set static files location
app.use(express.static(__dirname + '/public'));

/ set up home page
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(config.port);
