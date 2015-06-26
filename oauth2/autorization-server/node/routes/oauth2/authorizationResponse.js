(function () {
    "use strict";

    // The authorization response endpoint.
    function postAuthorizationResponse(req, res) {
        // TODO: If we pass the parameters here via hidden fields we want to check them again.
        // TODO: Pass them signed/HMAC:ed?
        // TODO: Check login result and redirect to either the redirect URI along with the generated code and the supplied state; ...
        res.send('Hello World!');
    }

    module.exports = postAuthorizationResponse;
}());
