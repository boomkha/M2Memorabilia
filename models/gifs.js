//The GifDAO must be constructed with a connected database object
function GifsDAO(db) {
    "use strict";

    /* 
     * If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. 
     */
    if (false === (this instanceof GifsDAO)) {
        console.log('Warning: GifsDAO constructor called without "new" operator');
        return new GifsDAO(db);
    }

    var gifs = db.collection("gifs");

    this.insertEntry = function (gifObj, callback) {
        'use strict';

        gifs.insert(gifObj, function (err, result) {
            'use strict';

            //TODO: instead of throwing an error return a callback
            if (err) throw err;

            console.log('New .gif info is stored.');

            callback(err, result);
        });
    }

    this.getAllGifs = function (callback) {
    	'use strict';

		gifs.find().sort('timestamp', -1).toArray(function(err, items) {
            'use strict';
            if (err) throw err;

            console.log('Found ' + items.length + ' gifs');

            callback(err, items);
        });    	
    }
}

module.exports.GifsDAO = GifsDAO;