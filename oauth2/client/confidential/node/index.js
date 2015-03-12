"use strict";

var crypto      = require('crypto'),
    express     = require('express'),
    nconf       = require('nconf'),
    querystring = require('querystring'),
    request     = require('request'),
    util        = require('util'),

    app         = express(),
    state       = generateState(); // TODO: Store this in the client session instead.

function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

// Load config from the environment and command line.
nconf.env().argv();

// Load config from the settings file.
nconf.file('config.json');

// Provide config defaults.
nconf.defaults({
    'facebook': {
        // We redirect the resource owner's browser to the Facebook auth endpoint in order to get the authorization code.
        'authEndpoint': 'https://www.facebook.com/dialog/oauth?response_type=code&client_id=%s&redirect_uri=%s&scope=%s&state=%s',
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
        'authEndpoint': 'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=%s&redirect_uri=%s&scope=%s&state=%s',
        'redirectEndpoint': 'http://localhost:3000/redirect/google',
        'tokenEndpoint': 'https://www.googleapis.com/oauth2/v3/token',
        'userInfoEndpoint': 'https://www.googleapis.com/plus/v1/people/me',
        'scope': 'profile email'
    }
});

// Intercept Facebook login calls.
app.get('/login/facebook', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = generateState();

    // Redirect the user to the Facebook login dialog.
    // NB: The client id must be pre-registered at Facebook, along with the redirect endpoint.
    res.redirect(util.format(
        nconf.get('facebook:authEndpoint'),
        nconf.get('facebook:clientId'),
        nconf.get('facebook:redirectEndpoint'),
        nconf.get('facebook:scope'),
        state
    ));
});

// Intercept Google login calls.
app.get('/login/google', function(req, res) {
    // Generate random state to pass along to the auth endpoint.
    state = generateState();

    // Redirect the user to the Google login dialog.
    // NB: The client id must be pre-registered at Google, along with the redirect endpoint.
    res.redirect(util.format(
        nconf.get('google:authEndpoint'),
        nconf.get('google:clientId'),
        nconf.get('google:redirectEndpoint'),
        nconf.get('google:scope'),
        state
    ));
});

app.get('/redirect/facebook', function(req, res) {
    // Make sure the state was sent, and matches what we sent. It's required regardless of whether the call worked.
    if (!req.query.state) {
        res.send('Error: No state was received');

        return;
    }
    if (req.query.state !== state) {
        res.send('Error: Received state does not match sent state');

        return;
    }

    // Check for error, error_reason & error_description.
    if (req.query.error) {
        // Display error to user.
        res.send(util.format(
            'Error: %s, Reason: %s, Description: %s',
            req.query.error,
            req.query.error_reason,
            req.query.error_description
        ));

        return;
    }

    // Make sure the auth code was sent.
    if (!req.query.code) {
        res.send('Error: No auth code was received');

        return;
    }

    // Generate random state to pass along to the token endpoint.
    state = generateState();

    // Exchange the auth code for an access token.
    request.post({
        'url': nconf.get('facebook:tokenEndpoint'),
        'auth': {
            'user': nconf.get('facebook:clientId'),
            'pass': nconf.get('facebook:clientSecret')
        },
        'form': {
            'grant_type': 'authorization_code',
            'code': req.query.code,
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
});

app.get('/redirect/google', function(req, res) {
    // Make sure the state was sent, and matches what we sent. It's required regardless of whether the call worked.
    if (!req.query.state) {
        res.send('Error: No state was received');

        return;
    }
    if (req.query.state !== state) {
        res.send('Error: Received state does not match sent state');

        return;
    }

    // Check for error, error_reason & error_description.
    if (req.query.error) {
        // Display error to user.
        res.send(util.format(
            'Error: %s, Reason: %s, Description: %s',
            req.query.error,
            req.query.error_reason,
            req.query.error_description
        ));

        return;
    }

    // Make sure the auth code was sent.
    if (!req.query.code) {
        res.send('Error: No auth code was received');

        return;
    }

    // Generate random state to pass along to the token endpoint.
    state = generateState();

    // Exchange the auth code for an access token.
    request.post({
        'url': nconf.get('google:tokenEndpoint'),
        'form': {
            'grant_type': 'authorization_code',
            'code': req.query.code,
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
});

// Serve static files from the 'public' directory as a fallback.
app.use(express.static(__dirname + '/public'));

app.listen(3000);
console.log('Express started on port 3000');
