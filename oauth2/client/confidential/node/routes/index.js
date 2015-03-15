(function () {
    "use strict";

    var express     = require('express'),
        nconf       = require('nconf'),
        querystring = require('querystring'),

        oauth2      = require('../lib/oauth2'),
        util        = require('../lib/util'),

        router      = express.Router(),
        _state      = '';

    router.get('/', function(req, res) {
      res.render('index', {
          title:                    'Node.js OAuth2 Confidential Client Demo',
          facebookDisabledState:    nconf.get('facebook:enabled') === true ? '' : 'disabled="disabled"',
          googleDisabledState:      nconf.get('google:enabled')   === true ? '' : 'disabled="disabled"',
          linkedInDisabledState:    nconf.get('linkedin:enabled') === true ? '' : 'disabled="disabled"'
      });
    });

    // Handle Facebook login calls.
    router.get('/login/facebook', function(req, res) {
        // Generate random state to pass along to the auth endpoint.
        _state = util.generateState();

        // Redirect the user to the Facebook login dialog.
        // NB: The client id must be pre-registered at Facebook, along with the redirect endpoint.
        oauth2.redirectToAuthEndpoint(
            res,
            nconf.get('facebook:authEndpoint'),
            nconf.get('facebook:clientId'),
            util.createRedirectEndpointUri(nconf.get('facebook:redirectPath')),
            nconf.get('facebook:scope'),
            _state
        );
    });

    // Handle Google login calls.
    router.get('/login/google', function(req, res) {
        // Generate random state to pass along to the auth endpoint.
        _state = util.generateState();

        // Redirect the user to the Google login dialog.
        // NB: The client id must be pre-registered at Google, along with the redirect endpoint.
        oauth2.redirectToAuthEndpoint(
            res,
            nconf.get('google:authEndpoint'),
            nconf.get('google:clientId'),
            util.createRedirectEndpointUri(nconf.get('google:redirectPath')),
            nconf.get('google:scope'),
            _state
        );
    });

    // Handle LinkedIn login calls.
    router.get('/login/linkedin', function(req, res) {
        // Generate random state to pass along to the auth endpoint.
        _state = util.generateState();

        // Redirect the user to the LinkedIn login dialog.
        // NB: The client id must be pre-registered at LinkedIn, along with the redirect endpoint.
        oauth2.redirectToAuthEndpoint(
            res,
            nconf.get('linkedin:authEndpoint'),
            nconf.get('linkedin:clientId'),
            util.createRedirectEndpointUri(nconf.get('linkedin:redirectPath')),
            nconf.get('linkedin:scope'),
            _state
        );
    });

    // Handle Facebook redirects.
    router.get('/redirect/facebook', function(req, res) {
        // Handle the redirect response.
        oauth2.handleRedirect(req.query, _state)
            .then(function (authCode) {
                // Exchange the auth code for an access token.
                oauth2.postToTokenEndpoint(
                    nconf.get('facebook:tokenEndpoint'),
                    nconf.get('facebook:clientId'),
                    nconf.get('facebook:clientSecret'),
                    authCode,
                    util.createRedirectEndpointUri(nconf.get('facebook:redirectPath')))
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
    router.get('/redirect/google', function(req, res) {
        oauth2.handleRedirect(req.query, _state)
            .then(function (authCode) {
                // Exchange the auth code for an access token.
                oauth2.postToTokenEndpoint(
                    nconf.get('google:tokenEndpoint'),
                    nconf.get('google:clientId'),
                    nconf.get('google:clientSecret'),
                    authCode,
                    util.createRedirectEndpointUri(nconf.get('google:redirectPath')))
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
    router.get('/redirect/linkedin', function(req, res) {
        oauth2.handleRedirect(req.query, _state)
            .then(function (authCode) {
                // Exchange the auth code for an access token.
                oauth2.postToTokenEndpoint(
                    nconf.get('linkedin:tokenEndpoint'),
                    nconf.get('linkedin:clientId'),
                    nconf.get('linkedin:clientSecret'),
                    authCode,
                    util.createRedirectEndpointUri(nconf.get('linkedin:redirectPath')))
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
                                res.send('Error returned from LinkedIn user info endpoint: ' + error.message);
                            });
                    }, function (error) {
                        res.send('Error returned from LinkedIn token endpoint: ' + error.message);
                    });
            }, function (error) {
                res.send('Error returned from LinkedIn auth endpoint: ' + error.message);
            });
    });

    module.exports = router;
}());
