var MongoClient = require('mongodb').MongoClient;

exports.gallery = function(req, res) {
	MongoClient.connect('mongodb://localhost:27017/m2memorabilia', function(err, db) {
	    "use strict";
	    if(err) throw err;

	    var gifs = db.collection("gifs");

        gifs.find().sort('timestamp', -1).toArray(function(err, items) {
            "use strict";
            if (err) throw err;

            console.log("Found " + items.length + " gifs");

            res.json({ gifs : items });
        });
	});
};