function ContentHandler (db) {
    "use strict";

    this.displayMainPage = function(req, res) {
        return res.render('index', { title: 'Express' });
    }
}

module.exports = ContentHandler;