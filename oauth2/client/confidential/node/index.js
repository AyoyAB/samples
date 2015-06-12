(function () {
    "use strict";

    var express = require('express'),
        nconf   = require('nconf'),
        path    = require('path'),

        routes  = require('./routes/index'),

        app     = express();

    // Provide config defaults.
    nconf.defaults({
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

    // Set up the view engine.
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hjs');

    // Set up the routes.
    app.use('/', routes);

    // Serve static files from the 'public' directory as a fallback.
    app.use(express.static(path.join(__dirname, 'public')));

    app.listen(nconf.get('port'));
    console.log('Express started on ' + nconf.get('hostname') + ':' + nconf.get('port'));

    module.exports = app;
}());
