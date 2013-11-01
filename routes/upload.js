var fs = require('fs'),
    im = require('imagemagick'),
    rimraf = require('rimraf'),
    GifsDAO = require('../models/gifs').GifsDAO;

var upload_dir = __dirname + '/../public/uploads/',
    upload_tmp = __dirname + '/../public/uploads/tmp/',
    upload_gifs = __dirname + '/../public/gifs/';

var progress_counter = 0;

function UploadHandler(db, io) {
    'use strict';

    var gifDAO = new GifsDAO(db);

    this.upload = function(req, res) {
        var current_timestamp = new Date().getTime();
        var img_filename = 'img_' + current_timestamp + '.png';
        var thumb_filename = 'thumb_' + img_filename;
        var img_path = upload_dir + img_filename;
        var thumb_path = upload_dir + thumb_filename;

        fs.writeFile(img_path, new Buffer(req.body.bufferedImage, "base64"), function(err) {
            im.resize({
                srcData: fs.readFileSync(img_path, 'binary'),
                width:   150
            }, function(err, stdout, stderr){
                if (err) throw err
                fs.writeFileSync(thumb_path, stdout, 'binary');
                res.json({ thumbnail : thumb_filename });
            });
        });
    };

    this.gif = function(req, res) {
        var thumbnails = req.body.frameBuffer;

        fs.mkdir(upload_tmp, function(){
            console.log('Dir tmp created');
        });

        thumbnails.forEach(function(value){
            var img_part = value.split('thumb_')[1];

            fs.readFile(upload_dir + img_part, function(err, data) {
                if (err) throw err;
                fs.writeFile(upload_tmp + img_part, data, function (err) {
                    if (err) throw err;

                    progress_counter += 20;

                    io.sockets.on('connection', function (socket) {
                        console.log(progress_counter);
                        socket.emit('progress-action', { progress: progress_counter });
                    });
                });
            });
        });

        var gif_timestamp = new Date().getTime();
        var gif_filename = 'gif_' + gif_timestamp + '.gif';
        var gif_path = upload_gifs + gif_filename;

        im.convert(['-delay', '30', '-loop', '0', upload_tmp + 'img_*.png', gif_path],
        function(err, stdout){
            if (err) throw err;
            console.log('GIF is generated');
            
            progress_counter += 20;

            io.sockets.on('connection', function (socket) {
                console.log(progress_counter);
                socket.emit('progress-action', { progress: progress_counter });
            });

            im.convert([gif_path, '-layers', 'OptimizeTransparency', '+map', gif_path],
            function(err, stdout){
                if (err) throw err;

                console.log('Transparency is optimized');

                progress_counter += 20;

                io.sockets.on('connection', function (socket) {
                    console.log(progress_counter);
                    socket.emit('progress-action', { progress: progress_counter });
                });

                //resizing the gif to save disk space
                im.convert(['-size', '640x320', gif_path, '-resize', '320x240', gif_path],
                function(err, stdout){
                    if (err) throw err;

                    console.log('Gif is resized');

                    progress_counter += 20;

                    io.sockets.on('connection', function (socket) {
                        console.log(progress_counter);
                        socket.emit('progress-action', { progress: progress_counter });
                    });

                    var gif = {
                        'filename': gif_filename,
                        'path': gif_path,
                        'timestamp': gif_timestamp
                    }

                    gifDAO.insertEntry(gif, function(err, result) {
                        'use strict';

                        if (err) throw err;
                    });

                    res.json({ gif : gif_filename });
                });
            });

            //Remove the tmp dir
            rimraf(upload_tmp, function(err){
                if (err) throw new Error('ERROR!!!')

                console.log('tmp dir is deleted');

                progress_counter += 20;

                io.sockets.on('connection', function (socket) {
                    console.log(progress_counter);
                    socket.emit('progress-action', { progress: progress_counter });
                });
            });
        });
    }

}

module.exports = UploadHandler;
