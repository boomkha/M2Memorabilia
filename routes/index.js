var UploadHandler = require('./upload'),
	ContentHandler = require('./content'),
	GalleryHandler = require('./gallery');

module.exports = exports = function(app, db, io, s3) {

    var uploadHandler = new UploadHandler(db, io, s3);
    var galleryHandler = new GalleryHandler(db);
    var contentHandler = new ContentHandler(db);

    // The main page of the blog
    app.get('/', contentHandler.displayMainPage);

	app.post('/upload', uploadHandler.upload);
	app.post('/gif', uploadHandler.gif);
	app.get('/gallery', galleryHandler.gallery);
}