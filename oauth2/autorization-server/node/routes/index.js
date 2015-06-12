(function () {
    "use strict";

    var express = require('express'),

        router  = express.Router();

    // The authorization endpoint.
    router.get('/oauth2/authorization', function(req, res) {
        res.send('Hello World!');
    });

    // The token endpoint.
    router.get('/oauth2/token', function(req, res) {
        res.send('Hello World!');
    });

    module.exports = router;
}());
