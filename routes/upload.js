var fs = require('fs');
var im = require('imagemagick');
var rimraf = require('rimraf');

exports.upload = function(req, res) {
    var message = false;
    var upload_dir = __dirname + '/../public/uploads/';
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

    fs.mkdir(__dirname + '/../public/uploads/tmp/', function(){
        console.log('Dir tmp created');
    });

    thumbnails.forEach(function(value){
        var img_part = value.split('thumb_')[1];

        fs.readFile(__dirname + '/../public/uploads/' + img_part, function(err, data) {
            if (err) throw err;
            fs.writeFile(__dirname + '/../public/uploads/tmp/' + img_part, data, function (err) {
                if (err) throw err;
            });
        });
    });

    var gif_filename = 'gif_' + new Date().getTime() + '.gif';

    im.convert(['-delay', '30', '-loop', '0', __dirname + '/../public/uploads/tmp/img_*.png', __dirname + '/../public/uploads/gifs/' + gif_filename], 
    function(err, stdout){
        if (err) throw err;
        console.log('GIF is generated');
        
        //Remove the tmp dir
        rimraf(__dirname + '/../public/uploads/tmp/', function(err){
            if (err) throw new Error("ERROR!!!")
        });
    });
}
