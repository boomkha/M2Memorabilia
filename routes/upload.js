var fs = require('fs');

exports.view = function(req, res){
    res.render('upload', { title: 'M2Memorabilia' });
};

exports.upload = function(req, res) {
    var message = false;
    var upload_dir = __dirname + '/../public/uploads/';
    var current_timestamp = new Date().getTime();
    var uploaded_filename = current_timestamp + '_' + req.files.displayImage.name;
    
    fs.readFile(req.files.displayImage.path, function (err, data) {
        var new_path = upload_dir + uploaded_filename;
        fs.writeFile(new_path, data, function (err) {
            console.log(new_path)            
        });
    });

    res.render('upload', { title: 'M2Memorabilia' });
};