var fs = require('fs'),
    im = require('imagemagick'),
    rimraf = require('rimraf');

var upload_dir = __dirname + '/../public/uploads/',
    upload_tmp = __dirname + '/../public/uploads/tmp/',
    upload_gifs = __dirname + '/../public/gifs/';

exports.upload = function(req, res) {
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

exports.gif = function(req, res) {
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
            });
        });
    });

    var gif_filename = 'gif_' + new Date().getTime() + '.gif';
    var gif_path = upload_gifs + gif_filename;

    im.convert(['-delay', '30', '-loop', '0', upload_tmp + 'img_*.png', gif_path],
    function(err, stdout){
        if (err) throw err;
        console.log('GIF is generated');

        im.convert([gif_path, '-layers', 'OptimizeTransparency', '+map', gif_path], 
        function(err, stdout){
            if (err) throw err;

            console.log('Transparency is optimized');

            //resizing the gif to save disk space
            im.convert(['-size', '640x320', gif_path, '-resize', '320x240', gif_path], 
            function(err, stdout){
                if (err) throw err;
                
                console.log('Gif is resized');
            });
        });

        //Remove the tmp dir
        rimraf(upload_tmp, function(err){
            if (err) throw new Error("ERROR!!!")

            console.log('tmp dir is deleted');
        });
    });
}
