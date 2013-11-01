
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    upload = require('./routes/upload'),
    gallery = require('./routes/gallery'),
    MongoClient = require('mongodb').MongoClient,
    http = require('http'),
    path = require('path');

var app = express();

var server = http.createServer(app),
    io = require('socket.io').listen(server);

MongoClient.connect('mongodb://localhost:27017/m2memorabilia', function(err, db) {
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
    routes(app, db, io);

    server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });

    process.on('uncaughtException', function(err) {
        console.error(err.stack);
        if (typeof(res) !== 'undefined'){
            return res.render('error');
        }
    });
});
