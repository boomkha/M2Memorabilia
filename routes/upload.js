var fs = require('fs'),
    im = require('imagemagick'),
    rimraf = require('rimraf'),
    GifsDAO = require('../models/gifs').GifsDAO;

var Encoder = require('qr').Encoder;
var encoder = new Encoder;

var upload_dir = __dirname + '/../public/uploads/',
    upload_tmp = __dirname + '/../public/uploads/tmp/',
    upload_gifs = __dirname + '/../public/gifs/',
    upload_qrs = __dirname + '/../public/qrs/';

var progress_counter = 0;

function UploadHandler(db, io, s3) {
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
                if (err) {
                    progress_counter = 0;
                    try {
                        console.log(err.stack);
                        throw err;
                    } catch (e) {
                        io.sockets.emit('black_panther', { error: '60% of the time ...' });
                    }
                }
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

        var first_img = thumbnails[0].split('thumb_')[1];

        thumbnails.forEach(function(value){
            var img_part = value.split('thumb_')[1];

            fs.readFile(upload_dir + img_part, function(err, data) {
                if (err) throw err;
                fs.writeFile(upload_tmp + img_part, data, function (err) {
                    if (err) throw err;
                });
            });
        });

        var gif_timestamp = new Date().getTime();
        var gif_filename = 'gif_' + gif_timestamp + '.gif';
        var gif_path = upload_gifs + gif_filename;

        im.convert(['-delay', '30', '-loop', '0', upload_tmp + 'img_*.png', gif_path],
        function(err, stdout){
            if (err) {
                progress_counter = 0;
                try {
                    console.log(err.stack);
                    throw err;
                } catch (e) {
                    io.sockets.emit('black_panther', { error: '60% of the time ...' });
                }
            }
            else {
                progress_counter += 15;
            }

            console.log('GIF is generated');

            console.log(progress_counter+'%');

            io.sockets.emit('progress-action', { progress: progress_counter });

            im.convert([gif_path, '-layers', 'OptimizeTransparency', '+map', gif_path],
            function(err, stdout){
                if (err) throw err;
                else progress_counter += 15;

                console.log('Transparency is optimized');

                console.log(progress_counter+'%');

                io.sockets.emit('progress-action', { progress: progress_counter });

                //resizing the gif to save disk space
                im.convert(['-size', '640x320', gif_path, '-resize', '320x240', gif_path],
                function(err, stdout){
                    if (err) throw err;
                    else progress_counter += 15;

                    console.log('Gif is resized');

                    console.log(progress_counter+'%');

                    io.sockets.emit('progress-action', { progress: progress_counter });

                    var gif_bucket = 'm2memorabilia';

                    var buff = fs.readFileSync(gif_path, 'base64');

                    fs.readFile(gif_path, function(err, gifdata) {
                        if (err) throw err;
                        else progress_counter += 15;

                        console.log('Preparing the upload.');

                        var gif_key = 'gifs/' + gif_filename;

                        var s3_params = {ACL: "public-read", Bucket: gif_bucket, ContentType: "image/gif", Key: gif_key, Body: gifdata};
                        s3.putObject(s3_params, function (err, data) {
                            if (err) throw err;
                            else progress_counter += 10;

                            console.log('Successfully uploaded package.');

                            var aws_url = 'https://s3-eu-west-1.amazonaws.com/m2memorabilia/gifs/' + gif_filename;
                            var qr_img = 'qr_' + gif_timestamp + '.png';
                            var qr_path = upload_qrs + qr_img;

                            var gif = {
                                'filename': gif_filename,
                                'path': gif_path,
                                'url': aws_url,
                                'qr': qr_path,
                                'first_img': first_img,
                                'timestamp': gif_timestamp
                            }

                            encoder.on('end', function(){
                                console.log('QR image generated');
                            });
                            encoder.encode(aws_url, qr_path);

                            gifDAO.insertEntry(gif, function(err, result) {
                                'use strict';

                                if (err) throw err;
                            });

                            //invalidating progress_counter
                            progress_counter = 0;

                            res.json({ gif : gif_filename, url: aws_url , qr: qr_img});
                        });
                    });
                });
            });

            //Remove the tmp dir
            rimraf(upload_tmp, function(err){
                if (err) throw new Error('ERROR!!!')
                else progress_counter += 15;

                console.log('tmp dir is deleted');

                console.log(progress_counter+'%');

                io.sockets.emit('progress-action', { progress: progress_counter });
            });
        });
    }

}

module.exports = UploadHandler;
