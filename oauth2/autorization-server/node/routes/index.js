(function () {
    "use strict";

    var express         = require('express'),
        auth            = require('basic-auth'),

        authorization   = require('./oauth2/authorization'),

        router          = express.Router();

    // The authorization endpoint.
    router.get('/oauth2/authorization', authorization);

    // The authorization login endpoint.
    router.get('/oauth2/authorization-result', function(req, res) {
        // TODO: If we pass the parameters here via hidden fields we want to check them again.
        // TODO: Pass them signed/HMAC:ed?
        // TODO: Check login result and redirect to either the redirect URI along with the generated code and the supplied state; ...
        res.send('Hello World!');
    });

    // The token endpoint.
    router.get('/oauth2/token', function(req, res) {
        // TODO: Figure this out
        res.send('Hello World!');
    });

    module.exports = router;
}());
