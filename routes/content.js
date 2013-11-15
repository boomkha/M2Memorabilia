function ContentHandler (db) {
    "use strict";

    this.displayMainPage = function(req, res) {
        return res.render('index', { title: 'M2Memorabilia | GifGenerator' });
    }
}

module.exports = ContentHandler;