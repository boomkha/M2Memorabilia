var fs = require('fs');
var im = require('imagemagick');

exports.view = function(req, res){
    res.render('upload', { title: 'M2Memorabilia' });
};

exports.upload = function(req, res) {
    var message = false;
    var upload_dir = __dirname + '/../public/uploads/';
    var current_timestamp = new Date().getTime();
    var img_filename = current_timestamp + '_' + req.files.displayImage.name;
    var thumb_filename = 'thumb_' + img_filename;
    var img_path = upload_dir + img_filename;
    var thumb_path = upload_dir + thumb_filename;

    fs.readFile(req.files.displayImage.path, function (err, data) {
        fs.writeFile(img_path, data, function (err) {
            if (err) { console.log('There was an error uploading the image'); }

            im.resize({
              srcData: fs.readFileSync(img_path, 'binary'),
              width:   150
            }, function(err, stdout, stderr){
              if (err) throw err
              fs.writeFileSync(thumb_path, stdout, 'binary');
              console.log('resized kittens.jpg to fit within 256x256px')
            });
        });
    });

    res.redirect('/');
};