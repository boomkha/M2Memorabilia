
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    MongoClient = require('mongodb').MongoClient,
    config = require('konphyg')(__dirname + '/config');
    mongodbConfig = config('mongodb');
    http = require('http'),
    path = require('path'),
    AWS = require('aws-sdk');

AWS.config.loadFromPath('./config/aws_config.json');
var s3 = new AWS.S3();

var app = express();

var server = http.createServer(app),
    io = require('socket.io').listen(server);

var mongoConnection = mongodbConfig.host + ':' + mongodbConfig.port + '/' + mongodbConfig.database;

MongoClient.connect(mongoConnection, function(err, db) {
    'use strict';

    if(err) throw err;

    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/uploads', express.static(__dirname + '/public/uploads'));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    // Application routes
    routes(app, db, io, s3);

    server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });

    process.on('uncaughtException', function(err) {
        console.error(err.stack);
    });
});
