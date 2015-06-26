(function () {
    "use strict";

    var nconf       = require('nconf'),
        querystring = require('querystring'),
        _           = require('lodash');

    // The OAuth2 authorization endpoint.
    function getAuthorization(req, res) {
        var responseType    = req.query.response_type,
            clientId        = req.query.client_id,
            redirectUri     = req.query.redirect_uri,
            scope           = req.query.scope,
            state           = req.query.state,
            config          = nconf.get('clients'),
            allScopes       = nconf.get('scopes'),
            clientConfig,
            requestedScopes,
            matchedScopes,
            translatedScopes;

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
        if (redirectUri !=  clientConfig['redirectUri']) {
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

        // Make sure a valid response_type was sent.
        if (responseType !== clientConfig.responseType) {
            // Send an error to the redirect_uri callback.
            res.redirect(302, redirectUri + '?' + querystring.stringify({
                    error: 'unsupported_response_type',
                    error_description: res.__('invalid_response_type'),
                    state: state
                }));
            return;
        }

        // Make sure a scope was sent.
        if (!scope) {
            // Send an error to the redirect_uri callback.
            res.redirect(302, redirectUri + '?' + querystring.stringify({
                    error: 'invalid_scope',
                    error_description: res.__('missing_scope'),
                    state: state
                }));
            return;
        }

        // scope is actually a space-separated list.
        requestedScopes = scope.split(' ');

        // Match the scopes against the configured ones.
        matchedScopes = _.intersection(requestedScopes, clientConfig['scopes']);

        // Make sure at least one configured scope was matched.
        if (_.isEmpty(matchedScopes)) {
            // Send an error to the redirect_uri callback.
            res.redirect(302, redirectUri + '?' + querystring.stringify({
                    error: 'invalid_scope',
                    error_description: res.__('invalid_scope'),
                    state: state
                }));
            return;
        }

        // Look up the display names for the matched scopes.
        translatedScopes = _.map(matchedScopes, function(val) {
            if (_.has(allScopes, val)) {
                // Use the display name.
                return res.__(allScopes[val]);
            } else {
                // No display name found.
                return val;
            }
        });

        // TODO: Create the HMAC:ed, serialized parameter string.

        // Display the authorization page view.
        res.render('oauth2/authorization', {
            appName: clientConfig['displayName'],
            scopes: translatedScopes,
            // TODO: Add the HMAC:ed, serialized parameter string.
            i18n: function() { return function(key) { return res.__(key); } }
        });
    }

    module.exports = getAuthorization;
}());
