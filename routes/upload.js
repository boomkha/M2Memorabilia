var fs = require('fs');
var im = require('imagemagick');

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