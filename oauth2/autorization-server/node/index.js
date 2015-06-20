(function () {
    "use strict";

    var express = require('express'),
        i18n    = require("i18n"),
        nconf   = require('nconf'),
        path    = require('path'),

        routes  = require('./routes/index'),

        app     = express();

    // Load config from the settings file.
    nconf.file('config.json');

    // Configure 18n.
    i18n.configure({
        locales:        [ 'en' ],
        defaultLocale:  'en',
        directory:      __dirname + '/locales'
    });

    // Set up the view engine.
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hjs');

    // Set up the routes.
    app.use('/', routes);

    // Wire up i18n.
    app.use(i18n.init);

    // Serve static files from the 'public' directory as a fallback.
    app.use(express.static(path.join(__dirname, 'public')));

    app.listen(nconf.get('port'));
    console.log('Express started on ' + nconf.get('hostname') + ':' + nconf.get('port'));

    module.exports = app;
}());
