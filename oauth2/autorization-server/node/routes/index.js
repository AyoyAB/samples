(function () {
    "use strict";

    var express         = require('express'),
        auth            = require('basic-auth'),

        authorization   = require('./oauth2/authorization'),
        authResponse    = require('./oauth2/authorizationResponse'),

        router          = express.Router();

    // The authorization endpoint.
    router.get('/oauth2/authorization', authorization);

    // The authorization response endpoint.
    router.post('/oauth2/authorization-response', authResponse);

    // The token endpoint.
    router.get('/oauth2/token', function(req, res) {
        // TODO: Figure this out
        res.send('Hello World!');
    });

    module.exports = router;
}());
