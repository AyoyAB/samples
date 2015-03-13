"use strict";

var crypto      = require('crypto'),
    Q           = require('q'),
    querystring = require('querystring');

/**
 * Generates random state.
 *
 * @returns {string} the generated random state.
 */
exports.generateState = function () {
    return crypto.randomBytes(16).toString('hex');
};

/**
 * Redirects the browser to the given OAuth2 Authorization Endpoint.
 *
 * @param {object} response         the Express.js response object.
 * @param {string} authEndpoint     the OAuth2 Authorization Endpoint URI to redirect to.
 * @param {string} clientId         the OAuth2 Client Identifier to send.
 * @param {string} redirectEndpoint the OAUth2 Redirection Endpoint to send.
 * @param {string} scope            the OAuth2 Scope to request.
 * @param {string} state            random state data to send.
 */
exports.redirectToAuthEndpoint = function (response, authEndpoint, clientId, redirectEndpoint, scope, state) {
    // Create the query string.
    var qs = querystring.stringify({
        'response_type':    'code',
        'client_id':        clientId,
        'redirect_uri':     redirectEndpoint,
        'scope':            scope,
        'state':            state
    });

    // Redirect the user to the authorization endpoint.
    response.redirect(authEndpoint + '?' + qs);
};

/**
 * Handles the redirect from the OAuth2 Authorization Endpoint.
 *
 * @param query         The Express.js query object.
 * @param originalState The random state data we sent to the Authorization Endpoint.
 *
 * @returns {*} A promise that will be resolved with the returned auth code on success, or rejected with an Error
 *              object on failure.
 */
exports.handleRedirect = function (query, originalState) {
    return Q.Promise(function (resolve, reject) {
        // Make sure the state was sent, and matches what we sent. It's required regardless of whether the call worked.
        if (!query.state) {
            reject(new Error('No state was received'));
        }
        if (query.state !== originalState) {
            reject(new Error('Received state does not match original state'));
        }

        // Check for error, error_reason & error_description.
        if (query.error) {
            reject(new Error('Authorization endpoint returned error: '
                + query.error
                + ', with reason: '
                + query.error_reason
                + ', and description: '
                + query.error_description
            ));
        }

        // Make sure the auth code was sent.
        if (!query.code) {
            reject(new Error('No auth code was received from the authorization endpoint'));
        }

        resolve(query.code);
    });
};
