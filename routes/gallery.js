var GifsDAO = require('../models/gifs').GifsDAO;

function GalleryHandler(db) {
    'use strict';

    var gifDAO = new GifsDAO(db);

    this.gallery = function(req, res) {
        gifDAO.getAllGifs(function(err, items){
            return res.render('gallery', { title: 'M2Memorabilia | GifGallery', gifs: items });
        });
    };

}

module.exports = GalleryHandler;
