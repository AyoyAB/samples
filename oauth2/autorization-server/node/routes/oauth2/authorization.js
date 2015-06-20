(function () {
    "use strict";

    var nconf       = require('nconf'),
        querystring = require('querystring');

    // The OAuth2 authorization endpoint.
    function getAuthorization(req, res) {
        var responseType    = req.query.response_type,
            clientId        = req.query.client_id,
            redirectUri     = req.query.redirect_uri,
            scope           = req.query.scope,
            state           = req.query.state,
            config          = nconf.get('clients'),
            clientConfig;

        // Make sure a client_id was sent.
        if (!clientId) {
            // Inform the resource owner of the missing client_id.
            res.status(400).send(res.__('missing_client_id'));
            return;
        }

        // Look up the client configuration.
        clientConfig = config[clientId];

        // Make sure a valid client_id was sent.
        if (!clientConfig) {
            // Inform the resource owner of the invalid client_id.
            res.status(400).send(res.__('invalid_client_id'));
            return;
        }

        // Make sure a redirect_uri was sent.
        // NB: We are mandating redirect_uri even though it is optional in the standard.
        if (!redirectUri) {
            // Inform the resource owner of the missing redirect_uri.
            res.status(400).send(res.__('missing_redirect_uri'));
            return;
        }

        // Make sure a valid redirect_uri was sent.
        if (clientConfig.redirectUri.indexOf(redirectUri) !== 0) {
            // Inform the resource owner of the invalid redirect_uri.
            res.status(400).send(res.__('invalid_redirect_uri'));
            return;
        }

        // Make sure a random state was sent.
        // NB: We are mandating state even though it is optional in the standard.
        if (!state) {
            // Send an error to the redirect_uri callback.
            res.redirect(302, redirectUri + '?' + querystring.stringify({
                    error: 'invalid_request',
                    error_description: res.__('missing_state')
                }));
            return;
        }

        // Make sure a response_type was sent.
        if (!responseType) {
            // Send an error to the redirect_uri callback.
            res.redirect(302, redirectUri + '?' + querystring.stringify({
                    error: 'invalid_request',
                    error_description: res.__('missing_response_type'),
                    state: state
                }));
            return;
        }

        // Make sure a valid redirect_uri was sent.
        if (responseType !== clientConfig.responseType) {
            // Send an error to the redirect_uri callback.
            res.redirect(302, redirectUri + '?' + querystring.stringify({
                    error: 'invalid_request',
                    error_description: res.__('invalid_response_type'),
                    state: state
                }));
            return;
        }

        // TODO: Validate scope.

        // TODO: Display static page with login form and consent checkbox.
        res.send('Hello World!');
    }

    module.exports = getAuthorization;
}());
