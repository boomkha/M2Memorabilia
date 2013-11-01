// Error handling middleware

exports.errorHandler = function(err, req, res) {
    'use strict';
    console.error(err.message);
    console.error(err.stack);
    res.status(500);
    
    //TODO: Make something here
    //res.render('error_template', { error: err });
}