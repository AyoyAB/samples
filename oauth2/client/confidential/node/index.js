"use strict";

var express     = require('express'),
    nconf       = require('nconf'),
    querystring = require('querystring'),
    request     = require('request'),

    oauth2      = require('./lib/oauth2'),

    app         = express(),
    state       = oauth2.generateState(); // TODO: Store this in the client session instead.

// Load config from the settings file.
nconf.file('config.json');

// Provide config defaults.
nconf.defaults({
    // TODO: Store these as options objects instead.
    'facebook': {
        // We redirect the resource owner's browser to the Facebook auth endpoint in order to get the authorization code.
        'authEndpoint': 'https://www.facebook.com/dialog/oauth',
        // This is the redirect endpoint we send along to the auth endpoint. It has to match our configured redirect endpoint.
        'redirectEndpoint': 'http://localhost:3000/redirect/facebook',
        // We post directly to the Facebook token endpoint in order to exchange the auth code for an access token.
        'tokenEndpoint': 'https://graph.facebook.com/oauth/access_token',
        // This is where we request information about the user of the access token.
        'userInfoEndpoint': 'https://graph.facebook.com/v2.2/me',
        // These are the OAuth2 scopes we request.
        'scope': 'public_profile email'
    },
    'google': {
        'authEndpoint': 'https://accounts.google.com/o/oauth2/auth',
        'redirectEndpoint': 'http://localhost:3000/redirect/google',
        'tokenEndpoint': 'https://www.googleapis.com/oauth2/v3/token',
        'userInfoEndpoint': 'https://www.googleapis.com/plus/v1/people/me',
        'scope': 'profile email'
    }
});

// Intercept Facebook login calls.
app.get('/login/facebook', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = oauth2.generateState();

    // Redirect the user to the Facebook login dialog.
    // NB: The client id must be pre-registered at Facebook, along with the redirect endpoint.
    oauth2.redirectToAuthEndpoint(
        res,
        nconf.get('facebook:authEndpoint'),
        nconf.get('facebook:clientId'),
        nconf.get('facebook:redirectEndpoint'),
        nconf.get('facebook:scope'),
        state
    );
});

// Intercept Google login calls.
app.get('/login/google', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = oauth2.generateState();

    // Redirect the user to the Google login dialog.
    // NB: The client id must be pre-registered at Google, along with the redirect endpoint.
    oauth2.redirectToAuthEndpoint(
        res,
        nconf.get('google:authEndpoint'),
        nconf.get('google:clientId'),
        nconf.get('google:redirectEndpoint'),
        nconf.get('google:scope'),
        state
    );
});

app.get('/redirect/facebook', function(req, res) {
    oauth2.handleRedirect(req.query, state)
        .then(function (authCode) {
            // Generate random state to pass along to the token endpoint.
            state = oauth2.generateState();

            // Exchange the auth code for an access token.
            request.post({
                    'url': nconf.get('facebook:tokenEndpoint'),
                    'auth': {
                        'user': nconf.get('facebook:clientId'),
                        'pass': nconf.get('facebook:clientSecret')
                    },
                    'form': {
                        'grant_type': 'authorization_code',
                        'code': authCode,
                        'redirect_uri': nconf.get('facebook:redirectEndpoint'),
                        'client_id': nconf.get('facebook:clientId') // NB: Facebook requires this, even though we send it in the auth header as well.
                    }},
                function (err, response, body) {
                    // Check for errors.
                    if (err) {
                        res.send('Error posting access_token: ' + err);

                        return;
                    }

                    // NB: Facebook doesn't return JSON as mandated by the spec.
                    var payload = querystring.parse(body);

                    // NB: Facebook only returns an access_token, valid for approximately 60 days, no refresh_token.
                    // NB: Facebook doesn't return the required token_type value. Implicitly bearer.
                    // NB: Facebook returns expires, as opposed to expires_in.
                    if (!payload.access_token || !payload.expires) {
                        res.send('Error: access_token or expires missing');
                    }

                    // Request user information at the userinfo endpoint.
                    // NB: The Facebook implementation predates OpenID Connect and is thus not compliant.
                    request.get(nconf.get('facebook:userInfoEndpoint'), {
                            'auth': {
                                'bearer': payload.access_token
                            }},
                        function (err, response, body) {
                            // Check for errors.
                            if (err) {
                                res.send('Error fetching user information: ' + err);

                                return;
                            }

                            // The body contains the user information as JSON.
                            // TODO: Redirect to logged in page?
                            var userInfo = JSON.parse(body);
                            res.send('Successfully logged in Facebook user id: ' + userInfo.id + ', with name: ' + userInfo.name + ', and email:' + userInfo.email);
                        }
                    );
                });
        }, function (error) {
            res.send('Error returned from auth endpoint: ' + error.message);
        });
});

app.get('/redirect/google', function(req, res) {
    oauth2.handleRedirect(req.query, state)
        .then(function (authCode) {
            // Generate random state to pass along to the token endpoint.
            state = oauth2.generateState();

            // Exchange the auth code for an access token.
            request.post({
                    'url': nconf.get('google:tokenEndpoint'),
                    'form': {
                        'grant_type': 'authorization_code',
                        'code': authCode,
                        'redirect_uri': nconf.get('google:redirectEndpoint'),
                        'client_id': nconf.get('google:clientId'), // NB: Google doesn't parse the auth header.
                        'client_secret': nconf.get('google:clientSecret') // NB: Google doesn't parse the auth header.
                    }},
                function (err, response, body) {
                    // Check for errors.
                    if (err) {
                        res.send('Error posting access_token: ' + err);

                        return;
                    }

                    // Parse the response.
                    var payload = JSON.parse(body);

                    if (!payload.access_token || !payload.expires_in) {
                        res.send('Error: access_token or expires missing');
                    }

                    // Request user information at the userinfo endpoint.
                    // NB: The Facebook implementation predates OpenID Connect and is thus not compliant.
                    request.get(nconf.get('google:userInfoEndpoint'), {
                            'auth': {
                                'bearer': payload.access_token
                            }},
                        function (err, response, body) {
                            // Check for errors.
                            if (err) {
                                res.send('Error fetching user information: ' + err);

                                return;
                            }

                            // The body contains the user information as JSON.
                            // TODO: Redirect to logged in page?
                            var userInfo = JSON.parse(body);

                            res.send('Successfully logged in Google user id: ' + userInfo.id + ', with name: ' + userInfo.displayName + ', and email:' + userInfo.emails[0].value);
                        }
                    );
                });
        }, function (error) {
            res.send('Error returned from auth endpoint: ' + error.message);
        });
});

// Serve static files from the 'public' directory as a fallback.
app.use(express.static(__dirname + '/public'));

app.listen(3000);
console.log('Express started on port 3000');
