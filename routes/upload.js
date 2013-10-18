
/*
 * GET upload page.
 */

exports.view = function(req, res){
    res.render('upload', { title: 'M2Memorabilia' });
};

exports.upload = function(req, res) {
    var uploaded_filename = req.files.displayImage.name;
    console.log(upload_dir);
    // fs.readFile(req.files.displayImage.path, function (err, data) {
    //     var newPath = __dirname + "/uploads/uploadedFileName";
    //     fs.writeFile(newPath, data, function (err) {
    //         res.redirect("back");
    //     });
    // });
    res.redirect('/upload');
};