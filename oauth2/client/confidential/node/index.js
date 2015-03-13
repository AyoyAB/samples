"use strict";

var express     = require('express'),
    nconf       = require('nconf'),
    querystring = require('querystring'),

    oauth2      = require('./lib/oauth2'),

    app         = express(),
    state       = oauth2.generateState(); // TODO: Store this in the client session instead.

/**
 * Creates the absolute Redirect Endpoint URI for the specified path.
 *
 * @param {string} path The path to use.
 *
 * @returns {string} The absolute Redirect Endpoint URI.
 */
function createRedirectEndpointUri(path) {
    return 'http://' + nconf.get('hostname') + ':' + nconf.get('port') + path;
}

// Provide config defaults.
nconf.defaults({
    // NB: Microsoft won't allow a redirect URI for localhost, so if you wish to use Live ID you'll need to set up an alias.
    'hostname': 'localhost',
    'port': 3000,

    // TODO: Store these as options objects instead.
    'facebook': {
        'authEndpoint':     'https://www.facebook.com/dialog/oauth',
        'tokenEndpoint':    'https://graph.facebook.com/oauth/access_token',
        'userInfoEndpoint': 'https://graph.facebook.com/v2.2/me',
        'redirectPath':     '/redirect/facebook',
        'scope':            'public_profile email'
    },
    'google': {
        'authEndpoint':     'https://accounts.google.com/o/oauth2/auth',
        'tokenEndpoint':    'https://www.googleapis.com/oauth2/v3/token',
        'userInfoEndpoint': 'https://www.googleapis.com/plus/v1/people/me',
        'redirectPath':     '/redirect/google',
        'scope':            'profile email'
    },
    'linkedin': {
        'authEndpoint':     'https://www.linkedin.com/uas/oauth2/authorization',
        'tokenEndpoint':    'https://www.linkedin.com/uas/oauth2/accessToken',
        'userInfoEndpoint': 'https://api.linkedin.com/v1/people/~:(id,email-address,formatted-name)?format=json',
        'redirectPath':     '/redirect/linkedin',
        'scope':            'r_basicprofile r_emailaddress'
    }
});

// Load config from the settings file.
nconf.file('config.json');

// Handle Facebook login calls.
app.get('/login/facebook', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = oauth2.generateState();

    // Redirect the user to the Facebook login dialog.
    // NB: The client id must be pre-registered at Facebook, along with the redirect endpoint.
    oauth2.redirectToAuthEndpoint(
        res,
        nconf.get('facebook:authEndpoint'),
        nconf.get('facebook:clientId'),
        createRedirectEndpointUri(nconf.get('facebook:redirectPath')),
        nconf.get('facebook:scope'),
        state
    );
});

// Handle Google login calls.
app.get('/login/google', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = oauth2.generateState();

    // Redirect the user to the Google login dialog.
    // NB: The client id must be pre-registered at Google, along with the redirect endpoint.
    oauth2.redirectToAuthEndpoint(
        res,
        nconf.get('google:authEndpoint'),
        nconf.get('google:clientId'),
        createRedirectEndpointUri(nconf.get('google:redirectPath')),
        nconf.get('google:scope'),
        state
    );
});

// Handle LinkedIn login calls.
app.get('/login/linkedin', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = oauth2.generateState();

    // Redirect the user to the LinkedIn login dialog.
    // NB: The client id must be pre-registered at LinkedIn, along with the redirect endpoint.
    oauth2.redirectToAuthEndpoint(
        res,
        nconf.get('linkedin:authEndpoint'),
        nconf.get('linkedin:clientId'),
        createRedirectEndpointUri(nconf.get('linkedin:redirectPath')),
        nconf.get('linkedin:scope'),
        state
    );
});

// Handle Facebook redirects.
app.get('/redirect/facebook', function(req, res) {
    // Handle the redirect response.
    oauth2.handleRedirect(req.query, state)
        .then(function (authCode) {
            // Exchange the auth code for an access token.
            oauth2.postToTokenEndpoint(
                nconf.get('facebook:tokenEndpoint'),
                nconf.get('facebook:clientId'),
                nconf.get('facebook:clientSecret'),
                authCode,
                createRedirectEndpointUri(nconf.get('facebook:redirectPath')))
                .then(function (body) {
                    // NB: Facebook doesn't return JSON as mandated by the spec.
                    var payload = querystring.parse(body);

                    // NB: Facebook only returns an access_token, valid for approximately 60 days, no refresh_token.
                    // NB: Facebook doesn't return the required token_type value. Implicitly bearer.
                    // NB: Facebook returns expires, as opposed to expires_in.
                    if (!payload.access_token || !payload.expires) {
                        res.send('Error: access_token or expires missing');
                    }

                    oauth2.getUserInfo(nconf.get('facebook:userInfoEndpoint'), payload.access_token)
                        .then(function (userInfo) {
                            res.send('Successfully logged in Facebook user id: ' + userInfo.id + ', with name: ' + userInfo.name + ', and email:' + userInfo.email);
                        }, function (error) {
                            res.send('Error returned from Facebook user info endpoint: ' + error.message);
                        });
                }, function (error) {
                    res.send('Error returned from Facebook token endpoint: ' + error.message);
                });
        }, function (error) {
            res.send('Error returned from Facebook auth endpoint: ' + error.message);
        });
});

// Handle Google redirects.
app.get('/redirect/google', function(req, res) {
    oauth2.handleRedirect(req.query, state)
        .then(function (authCode) {
            // Exchange the auth code for an access token.
            oauth2.postToTokenEndpoint(
                nconf.get('google:tokenEndpoint'),
                nconf.get('google:clientId'),
                nconf.get('google:clientSecret'),
                authCode,
                createRedirectEndpointUri(nconf.get('google:redirectPath')))
                .then(function (body) {
                    // Parse the response.
                    var payload = JSON.parse(body);

                    if (!payload.access_token || !payload.expires_in) {
                        res.send('Error: access_token or expires missing');
                    }

                    oauth2.getUserInfo(nconf.get('google:userInfoEndpoint'), payload.access_token)
                        .then(function (userInfo) {
                            res.send('Successfully logged in Google user id: ' + userInfo.id + ', with name: ' + userInfo.displayName + ', and email:' + userInfo.emails[0].value);
                        }, function (error) {
                            res.send('Error returned from Google user info endpoint: ' + error.message);
                        });
                }, function (error) {
                    res.send('Error returned from Google token endpoint: ' + error.message);
                });
        }, function (error) {
            res.send('Error returned from Google auth endpoint: ' + error.message);
        });
});

// Handle LinkedIn redirects.
app.get('/redirect/linkedin', function(req, res) {
    oauth2.handleRedirect(req.query, state)
        .then(function (authCode) {
            // Exchange the auth code for an access token.
            oauth2.postToTokenEndpoint(
                nconf.get('linkedin:tokenEndpoint'),
                nconf.get('linkedin:clientId'),
                nconf.get('linkedin:clientSecret'),
                authCode,
                createRedirectEndpointUri(nconf.get('linkedin:redirectPath')))
                .then(function (body) {
                    // Parse the response.
                    var payload = JSON.parse(body);

                    if (!payload.access_token || !payload.expires_in) {
                        res.send('Error: access_token or expires missing');
                    }

                    oauth2.getUserInfo(nconf.get('linkedin:userInfoEndpoint'), payload.access_token)
                        .then(function (userInfo) {
                            res.send('Successfully logged in LinkedIn user id: ' + userInfo.id + ', with name: ' + userInfo.formattedName + ', and email:' + userInfo.emailAddress);
                        }, function (error) {
                            console.log('After userinfo2');
                            res.send('Error returned from LinkedIn user info endpoint: ' + error.message);
                        });
                }, function (error) {
                    res.send('Error returned from LinkedIn token endpoint: ' + error.message);
                });
        }, function (error) {
            res.send('Error returned from LinkedIn auth endpoint: ' + error.message);
        });
});

// Serve static files from the 'public' directory as a fallback.
app.use(express.static(__dirname + '/public'));

app.listen(nconf.get('port'));
console.log('Express started on ' + nconf.get('hostname') + ':' + nconf.get('port'));
