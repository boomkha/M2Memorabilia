var UploadHandler = require('./upload'),
	ContentHandler = require('./content'),
	GalleryHandler = require('./gallery'),
	ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db) {

    var uploadHandler = new UploadHandler(db);
    var galleryHandler = new GalleryHandler(db);
    var contentHandler = new ContentHandler(db);

    // The main page of the blog
    app.get('/', contentHandler.displayMainPage);

	app.post('/upload', uploadHandler.upload);
	app.post('/gif', uploadHandler.gif);
	app.get('/gallery', galleryHandler.gallery);

    // Error handling middleware
    app.use(ErrorHandler);
}